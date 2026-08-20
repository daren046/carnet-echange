package fr.carnet.echange.controller;

import fr.carnet.echange.dto.ApiResponse;
import fr.carnet.echange.dto.delivery.DeliveryDto;
import fr.carnet.echange.dto.delivery.OrderDto;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.service.DeliveryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'PARENT', 'ADMIN')")
    @PostMapping("/reserve/{bookCopyId}")
    public ApiResponse<DeliveryDto> reserve(Authentication authentication, @PathVariable Long bookCopyId) {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok("Réservation confirmée — livraison 1000 F",
                deliveryService.reserveWithDelivery(user, bookCopyId));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/orders")
    public ApiResponse<List<OrderDto>> myOrders(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok(deliveryService.myOrders(user));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/orders/{reservationId}/cancel")
    public ApiResponse<OrderDto> cancelOrder(Authentication authentication,
                                             @PathVariable Long reservationId) {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok("Réservation annulée — cauris et livraison remboursés",
                deliveryService.cancelReservation(user, reservationId));
    }

    @PreAuthorize("hasAnyRole('DELIVERER', 'ADMIN')")
    @GetMapping("/pending")
    public ApiResponse<List<DeliveryDto>> pending() {
        return ApiResponse.ok(deliveryService.pendingDeliveries());
    }

    @PreAuthorize("hasAnyRole('DELIVERER', 'ADMIN')")
    @GetMapping("/mine")
    public ApiResponse<List<DeliveryDto>> mine(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok(deliveryService.myDeliveries(user));
    }

    @PreAuthorize("hasAnyRole('DELIVERER', 'ADMIN')")
    @PostMapping("/{deliveryId}/assign")
    public ApiResponse<DeliveryDto> assign(Authentication authentication, @PathVariable Long deliveryId) {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok("Livraison prise en charge",
                deliveryService.assignDelivery(user, deliveryId));
    }

    @PreAuthorize("hasAnyRole('DELIVERER', 'ADMIN')")
    @PostMapping("/{deliveryId}/delivered")
    public ApiResponse<DeliveryDto> markDelivered(Authentication authentication, @PathVariable Long deliveryId) {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok("Livraison terminée",
                deliveryService.markDelivered(user, deliveryId));
    }
}
