package fr.carnet.echange.service;

import fr.carnet.echange.dto.notification.NotificationDto;
import fr.carnet.echange.entity.Notification;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.enums.NotificationType;
import fr.carnet.echange.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void notify(User user, NotificationType type, String title, String message, String link) {
        if (user == null) {
            return;
        }
        notificationRepository.save(new Notification(user, type, title, message, link));
    }

    public List<NotificationDto> list(User user) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    public long unreadCount(User user) {
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    @Transactional
    public void markRead(User user, Long id) {
        Notification notification = notificationRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Notification introuvable"));
        notification.markRead();
    }

    @Transactional
    public void markAllRead(User user) {
        notificationRepository.findByUserIdAndReadFalse(user.getId())
                .forEach(Notification::markRead);
    }

    private NotificationDto toDto(Notification n) {
        return new NotificationDto(
                n.getId(), n.getType(), n.getTitle(), n.getMessage(),
                n.getLink(), n.isRead(), n.getCreatedAt()
        );
    }
}
