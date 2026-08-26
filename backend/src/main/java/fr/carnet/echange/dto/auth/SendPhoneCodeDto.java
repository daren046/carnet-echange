package fr.carnet.echange.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record SendPhoneCodeDto(@NotBlank String phone) {}
