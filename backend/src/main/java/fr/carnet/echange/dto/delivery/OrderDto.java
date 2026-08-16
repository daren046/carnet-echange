package fr.carnet.echange.dto.delivery;

import fr.carnet.echange.enums.CopyStatus;
import fr.carnet.echange.enums.DeliveryStatus;

import java.time.Instant;

public record OrderDto(
        Long reservationId,
        Long bookCopyId,
        String bookTitle,
        String photoUrl,
        CopyStatus bookStatus,
        Long deliveryId,
        DeliveryStatus deliveryStatus,
        int deliveryFeePaid,
        String zoneName,
        boolean cancellable,
        Instant createdAt
) {}
