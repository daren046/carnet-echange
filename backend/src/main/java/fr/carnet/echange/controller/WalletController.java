package fr.carnet.echange.controller;

import fr.carnet.echange.dto.ApiResponse;
import fr.carnet.echange.dto.wallet.TopUpDto;
import fr.carnet.echange.dto.wallet.WalletDto;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.service.WalletService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    public ApiResponse<WalletDto> balance(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok(new WalletDto(walletService.getBalance(user)));
    }

    @PostMapping("/topup")
    public ApiResponse<WalletDto> topUp(Authentication authentication, @Valid @RequestBody TopUpDto dto) {
        User user = (User) authentication.getPrincipal();
        int balance = walletService.topUp(user, dto.provider(), dto.phoneNumber(), dto.amount());
        return ApiResponse.ok("Recharge Mobile Money confirmée", new WalletDto(balance));
    }
}
