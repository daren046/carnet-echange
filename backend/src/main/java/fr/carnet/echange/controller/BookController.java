package fr.carnet.echange.controller;

import fr.carnet.echange.dto.ApiResponse;
import fr.carnet.echange.dto.book.BookCopyDto;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.enums.BookCondition;
import fr.carnet.echange.enums.SchoolLevel;
import fr.carnet.echange.enums.Subject;
import fr.carnet.echange.service.BookCopyService;
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
            @RequestParam(required = false) SchoolLevel level,
            @RequestParam(required = false) Subject subject,
            @RequestParam(required = false) Boolean libraryMode,
            @RequestParam(required = false) Long zoneId,
            @RequestParam(required = false) String title) {
        return ApiResponse.ok(bookCopyService.search(level, subject, libraryMode, zoneId, title));
    }

    @GetMapping("/mine")
    public ApiResponse<List<BookCopyDto>> myDeposits(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok(bookCopyService.myDeposits(user));
    }

    @PostMapping("/deposit")
    public ApiResponse<BookCopyDto> deposit(
            Authentication authentication,
            @RequestParam String title,
            @RequestParam Subject subject,
            @RequestParam SchoolLevel level,
            @RequestParam BookCondition condition,
            @RequestParam(defaultValue = "false") boolean libraryMode,
            @RequestParam MultipartFile photo) throws IOException {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok("Livre déposé — +1 tampon !",
                bookCopyService.deposit(user, title, subject, level, condition, photo, libraryMode));
    }
}
