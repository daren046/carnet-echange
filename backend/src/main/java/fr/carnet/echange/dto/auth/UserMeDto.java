package fr.carnet.echange.dto.auth;

import fr.carnet.echange.enums.SchoolLevel;
import fr.carnet.echange.enums.UserRole;

public record UserMeDto(
        Long id,
        String firstName,
        String lastName,
        String email,
        UserRole role,
        SchoolLevel schoolLevel,
        Long zoneId,
        String zoneName,
        String zoneCode,
        int stampBalance,
        int depositBalance,
        int walletBalance,
        boolean hasDepositedBooks
) {}
