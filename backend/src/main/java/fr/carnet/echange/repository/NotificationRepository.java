package fr.carnet.echange.repository;

import fr.carnet.echange.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndReadFalse(Long userId);
    Optional<Notification> findByIdAndUserId(Long id, Long userId);
    List<Notification> findByUserIdAndReadFalse(Long userId);
}
