package fr.carnet.echange.dto.library;

import java.time.Instant;

public record LibraryLoanDto(
        Long id,
        Long bookCopyId,
        String bookTitle,
        String photoUrl,
        int depositAmount,
        boolean active,
        Instant borrowedAt,
        Instant returnedAt
) {}
