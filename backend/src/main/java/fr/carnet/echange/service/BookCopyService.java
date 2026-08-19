package fr.carnet.echange.service;

import fr.carnet.echange.dto.book.BookCopyDto;
import fr.carnet.echange.entity.BookCopy;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.entity.Zone;
import fr.carnet.echange.enums.*;
import fr.carnet.echange.repository.BookCopyRepository;
import fr.carnet.echange.repository.UserRepository;
import fr.carnet.echange.repository.ZoneRepository;
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

    public BookCopyService(BookCopyRepository bookCopyRepository,
                           FileStorageService fileStorageService,
                           StampService stampService,
                           UserRepository userRepository,
                           ZoneRepository zoneRepository) {
        this.bookCopyRepository = bookCopyRepository;
        this.fileStorageService = fileStorageService;
        this.stampService = stampService;
        this.userRepository = userRepository;
        this.zoneRepository = zoneRepository;
    }

    @Transactional
    public BookCopyDto deposit(User user, String title, Subject subject, SchoolLevel level,
                               BookCondition condition, MultipartFile photo, boolean libraryMode,
                               ListingCategory listingCategory, boolean anonymous, String quartier,
                               String contactName, String contactPhone, String contactEmail,
                               OfferType offerType, Integer expectedPrice)
            throws IOException {
        ListingCategory category = listingCategory != null ? listingCategory : ListingCategory.BOOKS;
        boolean hideIdentity = anonymous;
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

        String photoUrl = fileStorageService.store(photo);
        BookCopy copy = new BookCopy(title, resolvedSubject, resolvedLevel, condition, photoUrl, depositor, zone, libraryMode);
        copy.setListingCategory(category);
        copy.setAnonymous(hideIdentity);
        applyOffer(copy, libraryMode, category, offerType, expectedPrice);
        if (user == null) {
            copy.setContactName(normalizeName(contactName));
            copy.setContactPhone(normalizePhone(contactPhone));
            copy.setContactEmail(normalizeEmail(contactEmail));
        }
        copy = bookCopyRepository.save(copy);

        if (user != null && !libraryMode && !hideIdentity && category == ListingCategory.BOOKS) {
            stampService.creditDeposit(user, copy);
        }
        return toDto(copy, depositor);
    }

    public List<BookCopyDto> search(SchoolLevel level, Subject subject, Boolean libraryMode,
                                    Long zoneId, String title, ListingCategory listingCategory,
                                    User viewer) {
        return bookCopyRepository.search(CopyStatus.AVAILABLE, level, subject, libraryMode, zoneId, title, listingCategory)
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

    public BookCopyDto toDto(BookCopy copy) {
        return toDto(copy, null);
    }

    public BookCopyDto toDto(BookCopy copy, User viewer) {
        boolean hidden = copy.isAnonymous();
        boolean teamViewer = canSeePrivateFields(copy, viewer);
        String publicName;
        if (hidden) {
            publicName = "Anonyme";
        } else if (copy.getContactName() != null && !copy.getContactName().isBlank()) {
            publicName = copy.getContactName().trim();
        } else {
            publicName = copy.getDepositor().getFirstName() + " " + copy.getDepositor().getLastName();
        }
        boolean showContact = !hidden || teamViewer;
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
                visibleExpectedPrice(copy, viewer)
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

    private static Integer visibleExpectedPrice(BookCopy copy, User viewer) {
        if (copy.getOfferType() != OfferType.SALE
                || copy.getListingCategory() == ListingCategory.BOOKS
                || copy.getExpectedPrice() == null
                || viewer == null) {
            return null;
        }
        if (viewer.getRole() == UserRole.ADMIN) {
            return copy.getExpectedPrice();
        }
        if (copy.getDepositor() != null && copy.getDepositor().getId().equals(viewer.getId())
                && !ANONYMOUS_EMAIL.equalsIgnoreCase(viewer.getEmail())) {
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

    private User anonymousUser() {
        return userRepository.findByEmail(ANONYMOUS_EMAIL)
                .orElseThrow(() -> new IllegalStateException("Compte anonyme introuvable"));
    }
}
