package fr.carnet.echange.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record ConfirmPhoneCodeDto(
        @NotBlank String phone,
        @NotBlank String code
) {}
