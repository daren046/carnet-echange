package fr.carnet.echange.controller;

import fr.carnet.echange.dto.ApiResponse;
import fr.carnet.echange.dto.book.BookCopyDto;
import fr.carnet.echange.dto.book.CreditCaurisDto;
import fr.carnet.echange.dto.book.ExtraCaurisDecisionDto;
import fr.carnet.echange.dto.book.ModerationInboxDto;
import fr.carnet.echange.dto.book.PickupCostDto;
import fr.carnet.echange.dto.cauris.CaurisGrantDecisionDto;
import fr.carnet.echange.dto.cauris.CaurisGrantRequestDto;
import fr.carnet.echange.service.BookCopyService;
import fr.carnet.echange.service.CaurisGrantService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final BookCopyService bookCopyService;
    private final CaurisGrantService caurisGrantService;

    public AdminController(BookCopyService bookCopyService, CaurisGrantService caurisGrantService) {
        this.bookCopyService = bookCopyService;
        this.caurisGrantService = caurisGrantService;
    }

    @GetMapping("/moderation")
    public ApiResponse<ModerationInboxDto> inbox() {
        ModerationInboxDto books = bookCopyService.moderationInbox();
        return ApiResponse.ok(new ModerationInboxDto(
                books.pendingListings(),
                books.pendingCauris(),
                books.extraCaurisRequests(),
                caurisGrantService.pending()));
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
    public ApiResponse<BookCopyDto> creditCauris(@PathVariable Long id,
                                                 @RequestBody(required = false) CreditCaurisDto body) {
        Integer amount = body != null ? body.amount() : null;
        Integer pickupCost = body != null ? body.pickupCaurisCost() : null;
        return ApiResponse.ok("Cauris délivrés", bookCopyService.creditCauris(id, amount, pickupCost));
    }

    @PostMapping("/books/{id}/pickup-cost")
    public ApiResponse<BookCopyDto> setPickupCost(@PathVariable Long id, @RequestBody PickupCostDto body) {
        Integer pickupCost = body != null ? body.pickupCaurisCost() : null;
        return ApiResponse.ok("Coût au retrait enregistré", bookCopyService.setPickupCaurisCost(id, pickupCost));
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

    @PostMapping("/cauris-grants/{id}")
    public ApiResponse<CaurisGrantRequestDto> decideGrant(@PathVariable Long id,
                                                          @RequestBody CaurisGrantDecisionDto body) {
        boolean approved = body != null && body.approved();
        Integer amount = body != null ? body.amount() : null;
        return ApiResponse.ok(
                approved ? "Cauris accordés" : "Demande refusée",
                caurisGrantService.decide(id, approved, amount));
    }
}
