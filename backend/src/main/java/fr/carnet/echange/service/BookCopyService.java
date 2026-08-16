package fr.carnet.echange.service;

import fr.carnet.echange.dto.book.BookCopyDto;
import fr.carnet.echange.entity.BookCopy;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.enums.*;
import fr.carnet.echange.repository.BookCopyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class BookCopyService {

    private final BookCopyRepository bookCopyRepository;
    private final FileStorageService fileStorageService;
    private final StampService stampService;

    public BookCopyService(BookCopyRepository bookCopyRepository,
                           FileStorageService fileStorageService,
                           StampService stampService) {
        this.bookCopyRepository = bookCopyRepository;
        this.fileStorageService = fileStorageService;
        this.stampService = stampService;
    }

    @Transactional
    public BookCopyDto deposit(User user, String title, Subject subject, SchoolLevel level,
                               BookCondition condition, MultipartFile photo, boolean libraryMode)
            throws IOException {
        String photoUrl = fileStorageService.store(photo);
        BookCopy copy = new BookCopy(title, subject, level, condition, photoUrl, user, user.getZone(), libraryMode);
        copy = bookCopyRepository.save(copy);

        if (!libraryMode) {
            stampService.creditDeposit(user, copy);
        }
        return toDto(copy);
    }

    public List<BookCopyDto> search(SchoolLevel level, Subject subject, Boolean libraryMode,
                                    Long zoneId, String title) {
        return bookCopyRepository.search(CopyStatus.AVAILABLE, level, subject, libraryMode, zoneId, title)
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
        return new BookCopyDto(
                copy.getId(),
                copy.getTitle(),
                copy.getSubject(),
                copy.getLevel(),
                copy.getCondition(),
                copy.getPhotoUrl(),
                copy.getDepositor().getFirstName() + " " + copy.getDepositor().getLastName(),
                copy.getZone().getName(),
                copy.getStatus(),
                copy.isLibraryMode(),
                copy.getReservedBy() != null
                        ? copy.getReservedBy().getFirstName() + " " + copy.getReservedBy().getLastName()
                        : null,
                copy.getCreatedAt()
        );
    }
}
