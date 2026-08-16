package fr.carnet.echange.dto.auth;

import fr.carnet.echange.enums.SchoolLevel;
import fr.carnet.echange.enums.UserRole;
import fr.carnet.echange.validation.AllowedRegisterRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterDto(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @Email @NotBlank String email,
        @Size(min = 6) String password,
        @NotNull @AllowedRegisterRole UserRole role,
        SchoolLevel schoolLevel,
        @NotBlank String zoneCode
) {}
