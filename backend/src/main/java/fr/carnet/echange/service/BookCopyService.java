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
import java.util.List;

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
                               ListingCategory listingCategory, boolean anonymous, String zoneCode)
            throws IOException {
        ListingCategory category = listingCategory != null ? listingCategory : ListingCategory.BOOKS;
        boolean hideIdentity = anonymous || user == null;
        User depositor = user != null ? user : anonymousUser();
        Zone zone = depositor.getZone();
        if (user == null) {
            if (zoneCode == null || zoneCode.isBlank()) {
                throw new IllegalArgumentException("Indiquez votre quartier pour publier sans compte");
            }
            zone = zoneRepository.findByCode(zoneCode)
                    .orElseThrow(() -> new IllegalArgumentException("Zone inconnue : " + zoneCode));
        }
        SchoolLevel resolvedLevel = level != null ? level : SchoolLevel.CM2;
        if (category == ListingCategory.BOOKS && level == null) {
            throw new IllegalArgumentException("Le niveau scolaire est obligatoire pour un livre");
        }

        String photoUrl = fileStorageService.store(photo);
        BookCopy copy = new BookCopy(title, subject, resolvedLevel, condition, photoUrl, depositor, zone, libraryMode);
        copy.setListingCategory(category);
        copy.setAnonymous(hideIdentity);
        copy = bookCopyRepository.save(copy);

        if (user != null && !libraryMode && !hideIdentity) {
            stampService.creditDeposit(user, copy);
        }
        return toDto(copy);
    }

    public List<BookCopyDto> search(SchoolLevel level, Subject subject, Boolean libraryMode,
                                    Long zoneId, String title, ListingCategory listingCategory) {
        return bookCopyRepository.search(CopyStatus.AVAILABLE, level, subject, libraryMode, zoneId, title, listingCategory)
                .stream().map(this::toDto).toList();
    }

    public List<BookCopyDto> myDeposits(User user) {
        return bookCopyRepository.findByDepositorIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toDto).toList();
    }

    public BookCopy getById(Long id) {
        return bookCopyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Livre introuvable"));
    }

    public BookCopyDto toDto(BookCopy copy) {
        boolean hidden = copy.isAnonymous();
        return new BookCopyDto(
                copy.getId(),
                copy.getTitle(),
                copy.getSubject(),
                copy.getLevel(),
                copy.getCondition(),
                copy.getPhotoUrl(),
                hidden ? "Anonyme" : copy.getDepositor().getFirstName() + " " + copy.getDepositor().getLastName(),
                copy.getZone().getName(),
                copy.getStatus(),
                copy.isLibraryMode(),
                copy.getReservedBy() != null
                        ? copy.getReservedBy().getFirstName() + " " + copy.getReservedBy().getLastName()
                        : null,
                copy.getCreatedAt(),
                copy.getListingCategory(),
                hidden
        );
    }

    private User anonymousUser() {
        return userRepository.findByEmail(ANONYMOUS_EMAIL)
                .orElseThrow(() -> new IllegalStateException("Compte anonyme introuvable"));
    }
}
