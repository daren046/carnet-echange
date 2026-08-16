package fr.carnet.echange.dto.delivery;

import fr.carnet.echange.enums.DeliveryStatus;

import java.time.Instant;
import java.util.List;

public record DeliveryDto(
        Long id,
        String zoneName,
        String delivererName,
        DeliveryStatus status,
        int deliveryFee,
        int reservationCount,
        List<String> bookTitles,
        Instant createdAt
) {}
