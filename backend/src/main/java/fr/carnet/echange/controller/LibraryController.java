package fr.carnet.echange.controller;

import fr.carnet.echange.dto.ApiResponse;
import fr.carnet.echange.dto.book.BookCopyDto;
import fr.carnet.echange.dto.library.LibraryLoanDto;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.service.BookCopyService;
import fr.carnet.echange.service.LibraryService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/library")
public class LibraryController {

    private final LibraryService libraryService;
    private final BookCopyService bookCopyService;

    public LibraryController(LibraryService libraryService, BookCopyService bookCopyService) {
        this.libraryService = libraryService;
        this.bookCopyService = bookCopyService;
    }

    @GetMapping
    public ApiResponse<List<BookCopyDto>> available() {
        return ApiResponse.ok(libraryService.availableLibraryBooks().stream()
                .map(bookCopyService::toDto).toList());
    }

    @GetMapping("/deposit-amount")
    public ApiResponse<Map<String, Integer>> depositAmount() {
        return ApiResponse.ok(Map.of("amount", libraryService.getDepositAmount()));
    }

    @PostMapping("/borrow/{bookCopyId}")
    public ApiResponse<LibraryLoanDto> borrow(Authentication authentication, @PathVariable Long bookCopyId) {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok("Emprunt confirmé — caution versée",
                libraryService.borrow(user, bookCopyId));
    }

    @PostMapping("/return/{loanId}")
    public ApiResponse<LibraryLoanDto> returnBook(Authentication authentication, @PathVariable Long loanId) {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok("Livre rendu — caution remboursée",
                libraryService.returnBook(user, loanId));
    }

    @GetMapping("/loans")
    public ApiResponse<List<LibraryLoanDto>> myLoans(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok(libraryService.myLoans(user));
    }
}
