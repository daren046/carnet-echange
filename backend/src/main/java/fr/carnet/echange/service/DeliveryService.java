package fr.carnet.echange.service;

import fr.carnet.echange.dto.delivery.DeliveryDto;
import fr.carnet.echange.dto.delivery.OrderDto;
import fr.carnet.echange.entity.*;
import fr.carnet.echange.enums.CopyStatus;
import fr.carnet.echange.enums.DeliveryStatus;
import fr.carnet.echange.enums.NotificationType;
import fr.carnet.echange.enums.TransactionType;
import fr.carnet.echange.enums.UserRole;
import fr.carnet.echange.repository.DeliveryRepository;
import fr.carnet.echange.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final ReservationRepository reservationRepository;
    private final BookCopyService bookCopyService;
    private final StampService stampService;
    private final WalletService walletService;
    private final NotificationService notificationService;

    @Value("${app.delivery-fee}")
    private int deliveryFee;

    public DeliveryService(DeliveryRepository deliveryRepository,
                           ReservationRepository reservationRepository,
                           BookCopyService bookCopyService,
                           StampService stampService,
                           WalletService walletService,
                           NotificationService notificationService) {
        this.deliveryRepository = deliveryRepository;
        this.reservationRepository = reservationRepository;
        this.bookCopyService = bookCopyService;
        this.stampService = stampService;
        this.walletService = walletService;
        this.notificationService = notificationService;
    }

    @Transactional
    public DeliveryDto reserveWithDelivery(User user, Long bookCopyId) {
        BookCopy copy = bookCopyService.getById(bookCopyId);

        if (copy.getStatus() != CopyStatus.AVAILABLE) {
            throw new IllegalStateException("Ce livre n'est plus disponible");
        }
        if (copy.isLibraryMode()) {
            throw new IllegalStateException("Ce livre est en mode bibliothèque — utilisez l'emprunt");
        }
        if (user.getStampBalance() < 1) {
            throw new IllegalStateException("Solde de tampons insuffisant");
        }
        if (user.getWalletBalance() < deliveryFee) {
            throw new IllegalStateException("Solde Mobile Money insuffisant pour la livraison ("
                    + deliveryFee + " F requis)");
        }
        if (copy.getDepositor().getId().equals(user.getId())) {
            throw new IllegalStateException("Vous ne pouvez pas récupérer votre propre livre");
        }

        copy.setStatus(CopyStatus.RESERVED);
        copy.setReservedBy(user);

        Delivery delivery = findOrCreatePendingDelivery(copy.getZone());
        Reservation reservation = new Reservation(copy, user, deliveryFee);
        reservation.setDelivery(delivery);
        delivery.getReservations().add(reservation);
        reservationRepository.save(reservation);
        deliveryRepository.save(delivery);

        stampService.debitPickup(user, copy);
        walletService.debit(user, deliveryFee, TransactionType.DELIVERY_PAYMENT, copy,
                "Paiement livraison (" + deliveryFee + " F)");

        notificationService.notify(copy.getDepositor(), NotificationType.BOOK_RESERVED,
                "Livre réservé",
                user.getFirstName() + " a réservé « " + copy.getTitle() + " ».",
                "/my-deposits");

        return toDto(delivery);
    }

    @Transactional
    public OrderDto cancelReservation(User user, Long reservationId) {
        Reservation reservation = reservationRepository.findByIdAndUserId(reservationId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Réservation introuvable"));

        BookCopy copy = reservation.getBookCopy();
        Delivery delivery = reservation.getDelivery();

        if (copy.getStatus() != CopyStatus.RESERVED) {
            throw new IllegalStateException("Cette réservation ne peut plus être annulée");
        }
        if (delivery == null || delivery.getStatus() != DeliveryStatus.PENDING) {
            throw new IllegalStateException("Annulation impossible — livraison déjà en cours");
        }

        stampService.refundPickup(user, copy);
        walletService.credit(user, reservation.getDeliveryFeePaid(), TransactionType.DELIVERY_REFUND, copy,
                "Remboursement livraison — annulation : " + copy.getTitle());

        copy.setStatus(CopyStatus.AVAILABLE);
        copy.setReservedBy(null);

        notificationService.notify(copy.getDepositor(), NotificationType.BOOK_AVAILABLE,
                "Réservation annulée",
                "« " + copy.getTitle() + " » est de nouveau disponible.",
                "/my-deposits");

        OrderDto result = toOrderDto(reservation, copy, delivery);
        result = new OrderDto(
                result.reservationId(), result.bookCopyId(), result.bookTitle(), result.photoUrl(),
                CopyStatus.AVAILABLE, result.deliveryId(), result.deliveryStatus(),
                result.deliveryFeePaid(), result.zoneName(), false, result.createdAt());

        delivery.getReservations().remove(reservation);
        reservationRepository.delete(reservation);

        if (delivery.getReservations().isEmpty()) {
            deliveryRepository.delete(delivery);
        } else {
            deliveryRepository.save(delivery);
        }

        return result;
    }

    public List<OrderDto> myOrders(User user) {
        return reservationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(r -> toOrderDto(r, r.getBookCopy(), r.getDelivery()))
                .toList();
    }

    private Delivery findOrCreatePendingDelivery(Zone zone) {
        List<Delivery> pending = deliveryRepository.findByZoneIdAndStatusOrderByCreatedAtAsc(
                zone.getId(), DeliveryStatus.PENDING);
        if (!pending.isEmpty()) {
            return pending.getFirst();
        }
        return deliveryRepository.save(new Delivery(zone, deliveryFee));
    }

    public List<DeliveryDto> pendingDeliveries() {
        return deliveryRepository.findActiveDeliveries()
                .stream().map(this::toDto).toList();
    }

    public List<DeliveryDto> myDeliveries(User deliverer) {
        return deliveryRepository.findByDelivererIdOrderByCreatedAtDesc(deliverer.getId())
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public DeliveryDto assignDelivery(User deliverer, Long deliveryId) {
        if (deliverer.getRole() != UserRole.DELIVERER && deliverer.getRole() != UserRole.ADMIN) {
            throw new IllegalStateException("Seuls les livreurs peuvent prendre en charge une livraison");
        }
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new IllegalArgumentException("Livraison introuvable"));
        delivery.setDeliverer(deliverer);
        delivery.setStatus(DeliveryStatus.IN_PROGRESS);
        delivery.getReservations().forEach(r -> {
            r.getBookCopy().setStatus(CopyStatus.IN_DELIVERY);
            notificationService.notify(r.getUser(), NotificationType.DELIVERY_STARTED,
                    "Livreur en route",
                    "Votre commande « " + r.getBookCopy().getTitle() + " » est en cours de livraison.",
                    "/my-orders");
        });
        return toDto(deliveryRepository.save(delivery));
    }

    @Transactional
    public DeliveryDto markDelivered(User deliverer, Long deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new IllegalArgumentException("Livraison introuvable"));
        if (delivery.getDeliverer() == null || !delivery.getDeliverer().getId().equals(deliverer.getId())) {
            throw new IllegalStateException("Cette livraison ne vous est pas assignée");
        }
        delivery.setStatus(DeliveryStatus.DELIVERED);
        delivery.getReservations().forEach(r -> {
            BookCopy copy = r.getBookCopy();
            copy.setStatus(CopyStatus.DELIVERED);
            notificationService.notify(r.getUser(), NotificationType.DELIVERED,
                    "Livre livré",
                    "« " + copy.getTitle() + " » a été remis. Bonne lecture !",
                    "/my-orders");
            notificationService.notify(copy.getDepositor(), NotificationType.DELIVERED,
                    "Votre dépôt a été livré",
                    "« " + copy.getTitle() + " » a bien été remis au destinataire.",
                    "/my-deposits");
        });
        return toDto(deliveryRepository.save(delivery));
    }

    private OrderDto toOrderDto(Reservation reservation, BookCopy copy, Delivery delivery) {
        boolean cancellable = copy.getStatus() == CopyStatus.RESERVED
                && delivery != null
                && delivery.getStatus() == DeliveryStatus.PENDING;
        return new OrderDto(
                reservation.getId(),
                copy.getId(),
                copy.getTitle(),
                copy.getPhotoUrl(),
                copy.getStatus(),
                delivery != null ? delivery.getId() : null,
                delivery != null ? delivery.getStatus() : null,
                reservation.getDeliveryFeePaid(),
                copy.getZone().getName(),
                cancellable,
                reservation.getCreatedAt()
        );
    }

    private DeliveryDto toDto(Delivery delivery) {
        List<String> titles = delivery.getReservations().stream()
                .map(r -> r.getBookCopy().getTitle()).toList();
        return new DeliveryDto(
                delivery.getId(),
                delivery.getZone().getName(),
                delivery.getDeliverer() != null
                        ? delivery.getDeliverer().getFirstName() + " " + delivery.getDeliverer().getLastName()
                        : null,
                delivery.getStatus(),
                delivery.getDeliveryFee(),
                delivery.getReservations().size(),
                titles,
                delivery.getCreatedAt()
        );
    }
}
