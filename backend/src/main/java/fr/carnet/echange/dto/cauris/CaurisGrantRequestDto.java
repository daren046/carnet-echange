package fr.carnet.echange.dto.cauris;

import fr.carnet.echange.enums.GrantStatus;

import java.time.Instant;

public record CaurisGrantRequestDto(
        Long id,
        Long userId,
        String userName,
        String userEmail,
        String note,
        GrantStatus status,
        Integer amountGranted,
        Instant createdAt
) {}
