package fr.carnet.echange.controller;

import fr.carnet.echange.dto.ApiResponse;
import fr.carnet.echange.dto.notification.NotificationDto;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ApiResponse<List<NotificationDto>> list(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok(notificationService.list(user));
    }

    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> unreadCount(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok(Map.of("count", notificationService.unreadCount(user)));
    }

    @PostMapping("/{id}/read")
    public ApiResponse<Void> markRead(Authentication authentication, @PathVariable Long id) {
        User user = (User) authentication.getPrincipal();
        notificationService.markRead(user, id);
        return ApiResponse.ok("Notification lue", null);
    }

    @PostMapping("/read-all")
    public ApiResponse<Void> markAllRead(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        notificationService.markAllRead(user);
        return ApiResponse.ok("Toutes les notifications sont lues", null);
    }
}
