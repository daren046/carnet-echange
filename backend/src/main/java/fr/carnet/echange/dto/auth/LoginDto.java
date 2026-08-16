package fr.carnet.echange.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginDto(
        @NotBlank String email,
        @NotBlank String password
) {}
