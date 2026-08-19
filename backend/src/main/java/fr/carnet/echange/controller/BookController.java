package fr.carnet.echange.controller;

import fr.carnet.echange.dto.ApiResponse;
import fr.carnet.echange.dto.book.BookCopyDto;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.enums.BookCondition;
import fr.carnet.echange.enums.ListingCategory;
import fr.carnet.echange.enums.OfferType;
import fr.carnet.echange.enums.SchoolLevel;
import fr.carnet.echange.enums.Subject;
import fr.carnet.echange.service.BookCopyService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/books")
public class BookController {

    private final BookCopyService bookCopyService;

    public BookController(BookCopyService bookCopyService) {
        this.bookCopyService = bookCopyService;
    }

    @GetMapping
    public ApiResponse<List<BookCopyDto>> search(
            Authentication authentication,
            @RequestParam(required = false) SchoolLevel level,
            @RequestParam(required = false) Subject subject,
            @RequestParam(required = false) Boolean libraryMode,
            @RequestParam(required = false) Long zoneId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) ListingCategory listingCategory) {
        User viewer = authentication != null && authentication.getPrincipal() instanceof User u ? u : null;
        return ApiResponse.ok(bookCopyService.search(level, subject, libraryMode, zoneId, title, listingCategory, viewer));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/mine")
    public ApiResponse<List<BookCopyDto>> myDeposits(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok(bookCopyService.myDeposits(user));
    }

    @PostMapping("/deposit")
    public ApiResponse<BookCopyDto> deposit(
            Authentication authentication,
            @RequestParam String title,
            @RequestParam(required = false) Subject subject,
            @RequestParam(required = false) SchoolLevel level,
            @RequestParam BookCondition condition,
            @RequestParam(defaultValue = "false") boolean libraryMode,
            @RequestParam(defaultValue = "BOOKS") ListingCategory listingCategory,
            @RequestParam(defaultValue = "false") boolean anonymous,
            @RequestParam(required = false) String zoneCode,
            @RequestParam(required = false) String quartier,
            @RequestParam(required = false) String contactName,
            @RequestParam(required = false) String contactPhone,
            @RequestParam(required = false) String contactEmail,
            @RequestParam(defaultValue = "EXCHANGE") OfferType offerType,
            @RequestParam(required = false) Integer expectedPrice,
            @RequestParam MultipartFile photo) throws IOException {
        User user = authentication != null && authentication.getPrincipal() instanceof User u ? u : null;
        boolean guest = user == null;
        String quartierValue = (quartier != null && !quartier.isBlank()) ? quartier : zoneCode;
        BookCopyDto created = bookCopyService.deposit(
                user, title, subject, level, condition, photo, libraryMode, listingCategory, anonymous,
                quartierValue, contactName, contactPhone, contactEmail, offerType, expectedPrice);
        String message = guest
                ? "Annonce publiée — les intéressés pourront vous contacter directement"
                : anonymous
                    ? "Annonce publiée — votre identité reste cachée"
                    : listingCategory == ListingCategory.BOOKS
                        ? "Livre déposé — +1 tampon !"
                        : "Article déposé";
        return ApiResponse.ok(message, created);
    }
}
