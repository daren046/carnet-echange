package fr.carnet.echange.dto.auth;

import fr.carnet.echange.enums.SchoolLevel;
import jakarta.validation.constraints.NotBlank;

public record UpdateProfileDto(
        @NotBlank String firstName,
        @NotBlank String lastName,
        SchoolLevel schoolLevel,
        @NotBlank String zoneCode,
        String currentPassword,
        String newPassword
) {}
