package fr.carnet.echange.controller;

import fr.carnet.echange.dto.ApiResponse;
import fr.carnet.echange.dto.cauris.CaurisGrantCreateDto;
import fr.carnet.echange.dto.cauris.CaurisGrantRequestDto;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.service.CaurisGrantService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cauris")
@PreAuthorize("isAuthenticated()")
public class CaurisController {

    private final CaurisGrantService caurisGrantService;

    public CaurisController(CaurisGrantService caurisGrantService) {
        this.caurisGrantService = caurisGrantService;
    }

    @GetMapping("/grants")
    public ApiResponse<List<CaurisGrantRequestDto>> mine(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok(caurisGrantService.mine(user));
    }

    @PostMapping("/grants")
    public ApiResponse<CaurisGrantRequestDto> create(Authentication authentication,
                                                     @RequestBody CaurisGrantCreateDto body) {
        User user = (User) authentication.getPrincipal();
        String note = body != null ? body.note() : null;
        return ApiResponse.ok(
                "Demande transmise — nos équipes vous feront un retour sous 48 h",
                caurisGrantService.create(user, note));
    }
}
