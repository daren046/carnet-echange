package fr.carnet.echange.service;

import fr.carnet.echange.dto.book.BookCopyDto;
import fr.carnet.echange.dto.book.ModerationInboxDto;
import fr.carnet.echange.entity.BookCopy;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.entity.Zone;
import fr.carnet.echange.enums.*;
import fr.carnet.echange.repository.BookCopyRepository;
import fr.carnet.echange.repository.UserRepository;
import fr.carnet.echange.repository.ZoneRepository;
import fr.carnet.echange.util.CaurisLabels;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
public class BookCopyService {

    public static final String ANONYMOUS_EMAIL = "anonyme@perso.local";

    private final BookCopyRepository bookCopyRepository;
    private final FileStorageService fileStorageService;
    private final StampService stampService;
    private final UserRepository userRepository;
    private final ZoneRepository zoneRepository;
    private final NotificationService notificationService;

    public BookCopyService(BookCopyRepository bookCopyRepository,
                           FileStorageService fileStorageService,
                           StampService stampService,
                           UserRepository userRepository,
                           ZoneRepository zoneRepository,
                           NotificationService notificationService) {
        this.bookCopyRepository = bookCopyRepository;
        this.fileStorageService = fileStorageService;
        this.stampService = stampService;
        this.userRepository = userRepository;
        this.zoneRepository = zoneRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public BookCopyDto deposit(User user, String title, Subject subject, SchoolLevel level,
                               BookCondition condition, MultipartFile photo, boolean libraryMode,
                               ListingCategory listingCategory, boolean anonymous, String quartier,
                               String contactName, String contactPhone, String contactEmail,
                               OfferType offerType, Integer expectedPrice,
                               boolean extraCaurisRequested, String extraCaurisNote,
                               ListingKind listingKind, String description)
            throws IOException {
        ListingCategory category = listingCategory != null ? listingCategory : ListingCategory.BOOKS;
        ListingKind kind = listingKind != null ? listingKind : ListingKind.OFFER;
        boolean wanted = kind == ListingKind.WANTED;
        boolean hideIdentity = anonymous;
        boolean library = libraryMode && !wanted;
        User depositor = user != null ? user : anonymousUser();

        String quartierValue = quartier != null ? quartier.trim() : "";
        if (quartierValue.isBlank() && user != null && user.getZone() != null) {
            quartierValue = user.getZone().getName();
        }
        if (quartierValue.isBlank()) {
            throw new IllegalArgumentException("Indiquez votre quartier");
        }
        Zone zone = resolveZone(quartierValue);

        SchoolLevel resolvedLevel = resolveLevel(category, level);
        Subject resolvedSubject = subject != null ? subject : Subject.AUTRE;
        if (category == ListingCategory.MISC) {
            resolvedSubject = Subject.AUTRE;
        }

        if (user == null && !hideIdentity) {
            applyGuestContact(contactName, contactPhone, contactEmail);
        }
        if (wanted && normalizePhone(contactPhone) == null) {
            throw new IllegalArgumentException("Indiquez un numéro pour que l’on puisse vous proposer l’article");
        }

        String photoUrl = null;
        if (photo != null && !photo.isEmpty()) {
            photoUrl = fileStorageService.store(photo);
        } else if (!wanted) {
            throw new IllegalArgumentException("La photo est obligatoire");
        }
        BookCopy copy = new BookCopy(title, resolvedSubject, resolvedLevel,
                condition != null ? condition : BookCondition.BON, photoUrl, depositor, zone, library);
        copy.setListingCategory(category);
        copy.setListingKind(kind);
        copy.setDescription(normalizeDescription(description, wanted));
        copy.setAnonymous(hideIdentity);
        if (wanted) {
            copy.setOfferType(OfferType.EXCHANGE);
            copy.setExpectedPrice(null);
        } else {
            applyOffer(copy, library, category, offerType, expectedPrice);
        }
        if (user == null || wanted) {
            copy.setContactName(normalizeName(contactName));
            copy.setContactPhone(normalizePhone(contactPhone));
            copy.setContactEmail(normalizeEmail(contactEmail));
        }
        if (user == null) {
            copy.setStatus(CopyStatus.PENDING_REVIEW);
        }
        if (!wanted) {
            applyExtraCaurisRequest(copy, user, category, library, extraCaurisRequested, extraCaurisNote);
        }
        copy = bookCopyRepository.save(copy);
        return toDto(copy, depositor);
    }

    public List<BookCopyDto> search(SchoolLevel level, Subject subject, Boolean libraryMode,
                                    Long zoneId, String title, ListingCategory listingCategory,
                                    ListingKind listingKind, User viewer) {
        return bookCopyRepository.search(CopyStatus.AVAILABLE, level, subject, libraryMode, zoneId, title, listingCategory, listingKind)
                .stream().map(copy -> toDto(copy, viewer)).toList();
    }

    public List<BookCopyDto> myDeposits(User user) {
        return bookCopyRepository.findByDepositorIdOrderByCreatedAtDesc(user.getId())
                .stream().map(copy -> toDto(copy, user)).toList();
    }

    public BookCopy getById(Long id) {
        return bookCopyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Livre introuvable"));
    }

    public ModerationInboxDto moderationInbox() {
        List<BookCopyDto> pendingListings = bookCopyRepository
                .findByStatusOrderByCreatedAtDesc(CopyStatus.PENDING_REVIEW)
                .stream().map(copy -> toTeamDto(copy)).toList();
        List<BookCopyDto> pendingCauris = bookCopyRepository
                .findByCaurisCreditedFalseAndLibraryModeFalseAndListingCategoryAndStatusOrderByCreatedAtDesc(
                        ListingCategory.BOOKS, CopyStatus.AVAILABLE)
                .stream()
                .filter(this::eligibleForCauris)
                .map(this::toTeamDto)
                .toList();
        List<BookCopyDto> extraRequests = bookCopyRepository
                .findByExtraCaurisStatusOrderByCreatedAtDesc(ExtraCaurisStatus.PENDING)
                .stream().map(copy -> toTeamDto(copy)).toList();
        return new ModerationInboxDto(pendingListings, pendingCauris, extraRequests, List.of());
    }

    @Transactional
    public BookCopyDto approveListing(Long id) {
        BookCopy copy = getById(id);
        if (copy.getStatus() != CopyStatus.PENDING_REVIEW) {
            throw new IllegalStateException("Cette annonce n’est pas en attente de validation");
        }
        copy.setStatus(CopyStatus.AVAILABLE);
        bookCopyRepository.save(copy);
        return toTeamDto(copy);
    }

    @Transactional
    public BookCopyDto rejectListing(Long id) {
        BookCopy copy = getById(id);
        if (copy.getStatus() != CopyStatus.PENDING_REVIEW) {
            throw new IllegalStateException("Cette annonce n’est pas en attente de validation");
        }
        copy.setStatus(CopyStatus.REJECTED);
        bookCopyRepository.save(copy);
        return toTeamDto(copy);
    }

    @Transactional
    public BookCopyDto creditCauris(Long id, Integer pickupCaurisCost) {
        BookCopy copy = getById(id);
        if (copy.isCaurisCredited()) {
            throw new IllegalStateException("Le cauri a déjà été délivré pour cet article");
        }
        if (!eligibleForCauris(copy)) {
            throw new IllegalStateException("Ce dépôt n’ouvre pas droit à un cauri");
        }
        if (copy.getStatus() == CopyStatus.PENDING_REVIEW || copy.getStatus() == CopyStatus.REJECTED) {
            throw new IllegalStateException("Validez d’abord l’annonce");
        }
        if (pickupCaurisCost != null) {
            applyPickupCost(copy, pickupCaurisCost);
        }
        User depositor = copy.getDepositor();
        stampService.creditDeposit(depositor, copy);
        copy.setCaurisCredited(true);
        bookCopyRepository.save(copy);
        notificationService.notify(depositor, NotificationType.CAURIS_CREDITED,
                "Cauri délivré",
                "1 cauri a été crédité pour « " + copy.getTitle() + " », après validation de l’état.",
                "/history");
        return toTeamDto(copy);
    }

    @Transactional
    public BookCopyDto setPickupCaurisCost(Long id, Integer pickupCaurisCost) {
        BookCopy copy = getById(id);
        if (copy.getListingKind() == ListingKind.WANTED
                || copy.isLibraryMode()
                || copy.getListingCategory() != ListingCategory.BOOKS) {
            throw new IllegalStateException("Le coût au retrait ne s’applique qu’aux livres proposés");
        }
        applyPickupCost(copy, pickupCaurisCost);
        bookCopyRepository.save(copy);
        return toTeamDto(copy);
    }

    @Transactional
    public BookCopyDto requestExtraCauris(User user, Long id, String note) {
        BookCopy copy = getById(id);
        if (copy.getDepositor() == null || !copy.getDepositor().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Cet article ne vous appartient pas");
        }
        applyExtraCaurisRequest(copy, user, copy.getListingCategory(), copy.isLibraryMode(), true, note);
        bookCopyRepository.save(copy);
        return toDto(copy, user);
    }

    @Transactional
    public BookCopyDto decideExtraCauris(Long id, boolean approved, Integer amount) {
        BookCopy copy = getById(id);
        if (copy.getExtraCaurisStatus() != ExtraCaurisStatus.PENDING) {
            throw new IllegalStateException("Aucune demande de cauris supplémentaires en attente");
        }
        User depositor = copy.getDepositor();
        if (approved) {
            if (amount == null || amount < 1) {
                throw new IllegalArgumentException("Indiquez le nombre de cauris supplémentaires à accorder");
            }
            if (amount > 20) {
                throw new IllegalArgumentException("Nombre de cauris trop élevé");
            }
            stampService.creditExtra(depositor, copy, amount);
            copy.setExtraCaurisStatus(ExtraCaurisStatus.APPROVED);
            copy.setExtraCaurisAmount(amount);
            notificationService.notify(depositor, NotificationType.EXTRA_CAURIS,
                    "Cauris supplémentaires accordés",
                    CaurisLabels.extra(amount) + " ont été crédités pour « " + copy.getTitle() + " ».",
                    "/history");
        } else {
            copy.setExtraCaurisStatus(ExtraCaurisStatus.REJECTED);
            notificationService.notify(depositor, NotificationType.EXTRA_CAURIS,
                    "Demande de cauris supplémentaires",
                    "La demande de cauris supplémentaires pour « " + copy.getTitle() + " » n’a pas été retenue.",
                    "/seller");
        }
        bookCopyRepository.save(copy);
        return toTeamDto(copy);
    }

    public BookCopyDto toDto(BookCopy copy) {
        return toDto(copy, null, false);
    }

    public BookCopyDto toDto(BookCopy copy, User viewer) {
        return toDto(copy, viewer, false);
    }

    private BookCopyDto toTeamDto(BookCopy copy) {
        return toDto(copy, null, true);
    }

    private BookCopyDto toDto(BookCopy copy, User viewer, boolean forceTeam) {
        boolean hidden = copy.isAnonymous();
        boolean teamViewer = forceTeam || canSeePrivateFields(copy, viewer);
        String publicName;
        if (hidden) {
            publicName = "Anonyme";
        } else if (copy.getContactName() != null && !copy.getContactName().isBlank()) {
            publicName = copy.getContactName().trim();
        } else {
            publicName = copy.getDepositor().getFirstName() + " " + copy.getDepositor().getLastName();
        }
        boolean showContact = teamViewer || !hidden
                || (copy.getListingKind() == ListingKind.WANTED && copy.getContactPhone() != null);
        return new BookCopyDto(
                copy.getId(),
                copy.getTitle(),
                copy.getSubject(),
                copy.getLevel(),
                copy.getCondition(),
                copy.getPhotoUrl(),
                publicName,
                copy.getZone().getName(),
                copy.getStatus(),
                copy.isLibraryMode(),
                copy.getReservedBy() != null
                        ? copy.getReservedBy().getFirstName() + " " + copy.getReservedBy().getLastName()
                        : null,
                copy.getCreatedAt(),
                copy.getListingCategory(),
                hidden,
                showContact ? blankToNull(copy.getContactName()) : null,
                showContact ? blankToNull(copy.getContactPhone()) : null,
                showContact ? blankToNull(copy.getContactEmail()) : null,
                copy.getOfferType(),
                visibleExpectedPrice(copy, viewer, forceTeam),
                copy.isCaurisCredited(),
                copy.isExtraCaurisRequested(),
                teamViewer ? blankToNull(copy.getExtraCaurisNote()) : null,
                copy.getExtraCaurisStatus(),
                teamViewer ? copy.getExtraCaurisAmount() : null,
                copy.getListingKind(),
                blankToNull(copy.getDescription()),
                copy.getPickupCaurisCost()
        );
    }

    private static boolean canSeePrivateFields(BookCopy copy, User viewer) {
        if (viewer == null) {
            return false;
        }
        if (viewer.getRole() == UserRole.ADMIN) {
            return true;
        }
        return copy.getDepositor() != null
                && copy.getDepositor().getId().equals(viewer.getId())
                && !ANONYMOUS_EMAIL.equalsIgnoreCase(viewer.getEmail());
    }

    private static Integer visibleExpectedPrice(BookCopy copy, User viewer, boolean forceTeam) {
        if (copy.getOfferType() != OfferType.SALE
                || copy.getListingCategory() == ListingCategory.BOOKS
                || copy.getExpectedPrice() == null) {
            return null;
        }
        if (forceTeam || canSeePrivateFields(copy, viewer)) {
            return copy.getExpectedPrice();
        }
        return null;
    }

    private static void applyOffer(BookCopy copy, boolean libraryMode, ListingCategory category,
                                   OfferType offerType, Integer expectedPrice) {
        if (libraryMode) {
            copy.setOfferType(OfferType.EXCHANGE);
            copy.setExpectedPrice(null);
            return;
        }
        OfferType type = offerType != null ? offerType : OfferType.EXCHANGE;
        copy.setOfferType(type);
        if (type != OfferType.SALE || category == ListingCategory.BOOKS) {
            copy.setExpectedPrice(null);
            return;
        }
        if (expectedPrice == null || expectedPrice < 1) {
            throw new IllegalArgumentException("Indiquez le prix attendu pour une vente");
        }
        if (expectedPrice > 50_000_000) {
            throw new IllegalArgumentException("Prix trop élevé");
        }
        copy.setExpectedPrice(expectedPrice);
    }

    private SchoolLevel resolveLevel(ListingCategory category, SchoolLevel level) {
        if (category == ListingCategory.BOOKS) {
            if (level == null) {
                throw new IllegalArgumentException("Choisissez une catégorie");
            }
            return level;
        }
        return level != null ? level : SchoolLevel.CM2;
    }

    private void applyGuestContact(String contactName, String contactPhone, String contactEmail) {
        if (normalizeName(contactName) == null) {
            throw new IllegalArgumentException("Indiquez votre nom pour que l’on puisse vous contacter");
        }
        if (normalizePhone(contactPhone) == null) {
            throw new IllegalArgumentException("Indiquez un numéro de téléphone pour que l’on puisse vous contacter");
        }
        if (contactEmail != null && !contactEmail.isBlank() && normalizeEmail(contactEmail) == null) {
            throw new IllegalArgumentException("Email invalide");
        }
    }

    private Zone resolveZone(String quartier) {
        String name = quartier.replaceAll("\\s+", " ").trim();
        return zoneRepository.findByNameIgnoreCase(name)
                .or(() -> zoneRepository.findByCode(name.toUpperCase(Locale.ROOT)))
                .orElseGet(() -> zoneRepository.save(new Zone(uniqueZoneCode(name), name)));
    }

    private String uniqueZoneCode(String name) {
        String base = toZoneCode(name);
        String code = base;
        int i = 2;
        while (zoneRepository.findByCode(code).isPresent()) {
            code = base + "-" + i;
            i++;
            if (i > 80) {
                code = base + "-" + Long.toString(System.currentTimeMillis(), 36).toUpperCase(Locale.ROOT);
                break;
            }
        }
        return code;
    }

    private static String toZoneCode(String name) {
        String slug = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replaceAll("[^A-Za-z0-9]+", "-")
                .replaceAll("^-+|-+$", "")
                .toUpperCase(Locale.ROOT);
        if (slug.isBlank()) {
            slug = "QUARTIER";
        }
        return slug.length() > 36 ? slug.substring(0, 36) : slug;
    }

    private static String normalizeName(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim().replaceAll("\\s+", " ");
        return trimmed.length() < 2 ? null : trimmed;
    }

    private static String normalizePhone(String value) {
        if (value == null) {
            return null;
        }
        String digits = value.replaceAll("[^0-9+]", "");
        if (!digits.matches("^\\+?[0-9]{8,15}$")) {
            return null;
        }
        return digits;
    }

    private static String normalizeEmail(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.isBlank()) {
            return null;
        }
        return trimmed.contains("@") && trimmed.contains(".") ? trimmed : null;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void applyExtraCaurisRequest(BookCopy copy, User user, ListingCategory category,
                                         boolean libraryMode, boolean requested, String note) {
        if (!requested) {
            return;
        }
        if (user == null || libraryMode || category != ListingCategory.BOOKS || copy.getListingKind() == ListingKind.WANTED) {
            throw new IllegalArgumentException("Les cauris supplémentaires concernent uniquement les livres déposés avec un compte");
        }
        if (copy.getExtraCaurisStatus() == ExtraCaurisStatus.PENDING) {
            throw new IllegalStateException("Une demande de cauris supplémentaires est déjà en cours");
        }
        if (copy.getExtraCaurisStatus() == ExtraCaurisStatus.APPROVED) {
            throw new IllegalStateException("Des cauris supplémentaires ont déjà été accordés pour cet article");
        }
        String trimmed = note == null ? "" : note.trim();
        if (trimmed.length() < 8) {
            throw new IllegalArgumentException("Précisez pourquoi ce livre justifie des cauris supplémentaires");
        }
        if (trimmed.length() > 500) {
            throw new IllegalArgumentException("Le message est trop long");
        }
        copy.setExtraCaurisRequested(true);
        copy.setExtraCaurisNote(trimmed);
        copy.setExtraCaurisStatus(ExtraCaurisStatus.PENDING);
    }

    private static void applyPickupCost(BookCopy copy, Integer pickupCaurisCost) {
        if (pickupCaurisCost == null) {
            return;
        }
        if (pickupCaurisCost < 1 || pickupCaurisCost > 20) {
            throw new IllegalArgumentException("Le coût au retrait doit être compris entre 1 et 20 cauris");
        }
        copy.setPickupCaurisCost(pickupCaurisCost);
    }

    private boolean eligibleForCauris(BookCopy copy) {
        if (copy.getListingKind() == ListingKind.WANTED) {
            return false;
        }
        if (copy.isLibraryMode() || copy.getListingCategory() != ListingCategory.BOOKS) {
            return false;
        }
        User depositor = copy.getDepositor();
        return depositor != null && !ANONYMOUS_EMAIL.equalsIgnoreCase(depositor.getEmail());
    }

    private static String normalizeDescription(String value, boolean wanted) {
        String trimmed = value == null ? "" : value.trim().replaceAll("\\s+", " ");
        if (wanted && trimmed.length() < 10) {
            throw new IllegalArgumentException("Décrivez un peu l’article que vous cherchez");
        }
        if (trimmed.length() > 1000) {
            throw new IllegalArgumentException("La description est trop longue");
        }
        return trimmed.isBlank() ? null : trimmed;
    }

    private User anonymousUser() {
        return userRepository.findByEmail(ANONYMOUS_EMAIL)
                .orElseThrow(() -> new IllegalStateException("Compte anonyme introuvable"));
    }
}
