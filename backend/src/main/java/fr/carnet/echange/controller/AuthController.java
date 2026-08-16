package fr.carnet.echange.controller;

import fr.carnet.echange.dto.ApiResponse;
import fr.carnet.echange.dto.auth.AuthResponse;
import fr.carnet.echange.dto.auth.LoginDto;
import fr.carnet.echange.dto.auth.RegisterDto;
import fr.carnet.echange.dto.auth.UserMeDto;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<UserMeDto> register(@Valid @RequestBody RegisterDto dto) {
        User user = authService.register(dto);
        return ApiResponse.ok("Inscription réussie — 1 tampon de bienvenue offert !",
                authService.toUserMeDto(user));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginDto dto) {
        return ApiResponse.ok(authService.login(dto));
    }

    @GetMapping("/me")
    public ApiResponse<UserMeDto> me(Authentication authentication) {
        return ApiResponse.ok(authService.getCurrentUser(authentication));
    }
}
