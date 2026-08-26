package fr.carnet.echange.dto.book;

import fr.carnet.echange.enums.BookCondition;
import fr.carnet.echange.enums.CopyStatus;
import fr.carnet.echange.enums.ExtraCaurisStatus;
import fr.carnet.echange.enums.ListingCategory;
import fr.carnet.echange.enums.ListingKind;
import fr.carnet.echange.enums.OfferType;
import fr.carnet.echange.enums.SchoolLevel;
import fr.carnet.echange.enums.Subject;

import java.time.Instant;

public record BookCopyDto(
        Long id,
        String title,
        Subject subject,
        SchoolLevel level,
        BookCondition condition,
        String photoUrl,
        String depositorName,
        String zoneName,
        CopyStatus status,
        boolean libraryMode,
        String reservedByName,
        Instant createdAt,
        ListingCategory listingCategory,
        boolean anonymous,
        String contactName,
        String contactPhone,
        String contactEmail,
        OfferType offerType,
        Integer expectedPrice,
        boolean caurisCredited,
        boolean extraCaurisRequested,
        String extraCaurisNote,
        ExtraCaurisStatus extraCaurisStatus,
        Integer extraCaurisAmount,
        ListingKind listingKind,
        String description,
        int pickupCaurisCost,
        int proposedCauris
) {}
