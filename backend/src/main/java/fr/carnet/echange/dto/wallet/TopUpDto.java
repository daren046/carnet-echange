package fr.carnet.echange.dto.wallet;

import fr.carnet.echange.enums.MobileMoneyProvider;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TopUpDto(
        @NotNull MobileMoneyProvider provider,
        @NotBlank String phoneNumber,
        @Min(100) int amount
) {}
