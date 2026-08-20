package fr.carnet.echange.controller;

import fr.carnet.echange.dto.ApiResponse;
import fr.carnet.echange.dto.book.BookCopyDto;
import fr.carnet.echange.dto.book.ExtraCaurisRequestDto;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.enums.BookCondition;
import fr.carnet.echange.enums.ListingCategory;
import fr.carnet.echange.enums.ListingKind;
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
            @RequestParam(required = false) ListingCategory listingCategory,
            @RequestParam(required = false) ListingKind listingKind) {
        User viewer = authentication != null && authentication.getPrincipal() instanceof User u ? u : null;
        return ApiResponse.ok(bookCopyService.search(level, subject, libraryMode, zoneId, title, listingCategory, listingKind, viewer));
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
            @RequestParam(required = false) BookCondition condition,
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
            @RequestParam(defaultValue = "false") boolean extraCaurisRequested,
            @RequestParam(required = false) String extraCaurisNote,
            @RequestParam(defaultValue = "OFFER") ListingKind listingKind,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) MultipartFile photo) throws IOException {
        User user = authentication != null && authentication.getPrincipal() instanceof User u ? u : null;
        boolean guest = user == null;
        boolean wanted = listingKind == ListingKind.WANTED;
        String quartierValue = (quartier != null && !quartier.isBlank()) ? quartier : zoneCode;
        BookCopyDto created = bookCopyService.deposit(
                user, title, subject, level, condition, photo, libraryMode, listingCategory, anonymous,
                quartierValue, contactName, contactPhone, contactEmail, offerType, expectedPrice,
                extraCaurisRequested, extraCaurisNote, listingKind, description);
        String message;
        if (guest) {
            message = wanted
                    ? "Recherche envoyée — elle sera visible après validation de l’équipe"
                    : "Offre envoyée — elle sera visible après validation de l’équipe";
        } else if (wanted) {
            message = anonymous
                    ? "Recherche publiée — votre identité reste cachée"
                    : "Recherche publiée — les personnes qui ont l’article pourront vous contacter";
        } else if (anonymous) {
            message = "Offre publiée — votre identité reste cachée";
        } else if (listingCategory == ListingCategory.BOOKS && !libraryMode) {
            message = extraCaurisRequested
                    ? "Livre déposé — 1 cauris après validation de l’état. Demande de cauris supplémentaires transmise (retour sous 48 h)"
                    : "Livre déposé — 1 cauris sera crédité après validation de l’état par l’équipe";
        } else {
            message = "Offre déposée";
        }
        return ApiResponse.ok(message, created);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{id}/extra-cauris")
    public ApiResponse<BookCopyDto> requestExtraCauris(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody ExtraCaurisRequestDto body) {
        User user = (User) authentication.getPrincipal();
        String note = body != null ? body.note() : null;
        return ApiResponse.ok(
                "Demande transmise — retour sous 48 h",
                bookCopyService.requestExtraCauris(user, id, note));
    }
}
