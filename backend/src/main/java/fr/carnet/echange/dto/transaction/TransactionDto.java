package fr.carnet.echange.dto.transaction;

import fr.carnet.echange.enums.TransactionType;

import java.time.Instant;

public record TransactionDto(
        Long id,
        TransactionType type,
        int stampDelta,
        int amount,
        String bookTitle,
        String description,
        Instant createdAt
) {}
