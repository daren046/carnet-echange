package fr.carnet.echange.service;

import fr.carnet.echange.dto.cauris.CaurisGrantRequestDto;
import fr.carnet.echange.entity.CaurisGrantRequest;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.enums.CopyStatus;
import fr.carnet.echange.enums.GrantStatus;
import fr.carnet.echange.enums.ListingCategory;
import fr.carnet.echange.enums.ListingKind;
import fr.carnet.echange.enums.NotificationType;
import fr.carnet.echange.repository.BookCopyRepository;
import fr.carnet.echange.repository.CaurisGrantRequestRepository;
import fr.carnet.echange.util.CaurisLabels;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CaurisGrantService {

    private final CaurisGrantRequestRepository grantRequestRepository;
    private final BookCopyRepository bookCopyRepository;
    private final StampService stampService;
    private final NotificationService notificationService;

    public CaurisGrantService(CaurisGrantRequestRepository grantRequestRepository,
                              BookCopyRepository bookCopyRepository,
                              StampService stampService,
                              NotificationService notificationService) {
        this.grantRequestRepository = grantRequestRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.stampService = stampService;
        this.notificationService = notificationService;
    }

    public boolean hasDepositedBooks(User user) {
        if (user == null) {
            return false;
        }
        return bookCopyRepository
                .countByDepositorIdAndListingCategoryAndListingKindAndLibraryModeFalseAndStatusNot(
                        user.getId(), ListingCategory.BOOKS, ListingKind.OFFER, CopyStatus.REJECTED) > 0;
    }

    public List<CaurisGrantRequestDto> pending() {
        return grantRequestRepository.findByStatusOrderByCreatedAtDesc(GrantStatus.PENDING)
                .stream().map(this::toDto).toList();
    }

    public List<CaurisGrantRequestDto> mine(User user) {
        return grantRequestRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public CaurisGrantRequestDto create(User user, String note) {
        if (hasDepositedBooks(user)) {
            throw new IllegalStateException(
                    "Vous avez déjà remis des livres — les cauris sont délivrés après validation de chaque dépôt");
        }
        if (grantRequestRepository.existsByUserIdAndStatus(user.getId(), GrantStatus.PENDING)) {
            throw new IllegalStateException("Une demande est déjà en cours — nos équipes vous répondent sous 48 h");
        }
        String trimmed = note == null ? "" : note.trim();
        if (trimmed.length() < 8) {
            throw new IllegalArgumentException("Précisez pourquoi vous avez besoin de cauris");
        }
        if (trimmed.length() > 500) {
            throw new IllegalArgumentException("Le message est trop long");
        }
        CaurisGrantRequest saved = grantRequestRepository.save(new CaurisGrantRequest(user, trimmed));
        return toDto(saved);
    }

    @Transactional
    public CaurisGrantRequestDto decide(Long id, boolean approved, Integer amount) {
        CaurisGrantRequest request = grantRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable"));
        if (request.getStatus() != GrantStatus.PENDING) {
            throw new IllegalStateException("Cette demande a déjà été traitée");
        }
        User member = request.getUser();
        if (approved) {
            if (amount == null || amount < 1) {
                throw new IllegalArgumentException("Indiquez le nombre de cauris à accorder");
            }
            if (amount > 20) {
                throw new IllegalArgumentException("Nombre de cauris trop élevé");
            }
            stampService.creditTeamGrant(member, amount);
            request.approve(amount);
            notificationService.notify(member, NotificationType.CAURIS_GRANT,
                    "Cauris accordés par l’équipe",
                    CaurisLabels.of(amount) + " ont été crédités sur votre compte.",
                    "/history");
        } else {
            request.reject();
            notificationService.notify(member, NotificationType.CAURIS_GRANT,
                    "Demande de cauris",
                    "Votre demande de cauris n’a pas été retenue. Vous pouvez en obtenir en remettant des livres.",
                    "/deposit");
        }
        return toDto(grantRequestRepository.save(request));
    }

    private CaurisGrantRequestDto toDto(CaurisGrantRequest request) {
        User user = request.getUser();
        return new CaurisGrantRequestDto(
                request.getId(),
                user.getId(),
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                request.getNote(),
                request.getStatus(),
                request.getAmountGranted(),
                request.getCreatedAt()
        );
    }
}
