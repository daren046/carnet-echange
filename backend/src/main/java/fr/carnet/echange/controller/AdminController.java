package fr.carnet.echange.controller;

import fr.carnet.echange.dto.ApiResponse;
import fr.carnet.echange.dto.book.BookCopyDto;
import fr.carnet.echange.dto.book.ExtraCaurisDecisionDto;
import fr.carnet.echange.dto.book.ModerationInboxDto;
import fr.carnet.echange.service.BookCopyService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final BookCopyService bookCopyService;

    public AdminController(BookCopyService bookCopyService) {
        this.bookCopyService = bookCopyService;
    }

    @GetMapping("/moderation")
    public ApiResponse<ModerationInboxDto> inbox() {
        return ApiResponse.ok(bookCopyService.moderationInbox());
    }

    @PostMapping("/listings/{id}/approve")
    public ApiResponse<BookCopyDto> approveListing(@PathVariable Long id) {
        return ApiResponse.ok("Annonce publiée", bookCopyService.approveListing(id));
    }

    @PostMapping("/listings/{id}/reject")
    public ApiResponse<BookCopyDto> rejectListing(@PathVariable Long id) {
        return ApiResponse.ok("Annonce refusée", bookCopyService.rejectListing(id));
    }

    @PostMapping("/books/{id}/credit-cauris")
    public ApiResponse<BookCopyDto> creditCauris(@PathVariable Long id) {
        return ApiResponse.ok("Cauris délivré", bookCopyService.creditCauris(id));
    }

    @PostMapping("/books/{id}/extra-cauris")
    public ApiResponse<BookCopyDto> decideExtraCauris(@PathVariable Long id,
                                                      @RequestBody ExtraCaurisDecisionDto body) {
        boolean approved = body != null && body.approved();
        Integer amount = body != null ? body.amount() : null;
        return ApiResponse.ok(
                approved ? "Cauris supplémentaires accordés" : "Demande refusée",
                bookCopyService.decideExtraCauris(id, approved, amount));
    }
}
