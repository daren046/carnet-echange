package fr.carnet.echange.dto.notification;

import fr.carnet.echange.enums.NotificationType;

import java.time.Instant;

public record NotificationDto(
        Long id,
        NotificationType type,
        String title,
        String message,
        String link,
        boolean read,
        Instant createdAt
) {}
