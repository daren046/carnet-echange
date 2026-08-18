package fr.carnet.echange.dto.stats;

public record ImpactStatsDto(
        long booksDeposited,
        long booksAvailable,
        long booksDelivered,
        long members,
        long estimatedSavedCfa
) {}
