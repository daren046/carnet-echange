package fr.carnet.echange.repository;

import fr.carnet.echange.entity.Delivery;
import fr.carnet.echange.enums.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    @Query("SELECT d FROM Delivery d WHERE d.status IN ('PENDING', 'IN_PROGRESS') ORDER BY d.createdAt ASC")
    List<Delivery> findActiveDeliveries();
    List<Delivery> findByDelivererIdOrderByCreatedAtDesc(Long delivererId);
    List<Delivery> findByZoneIdAndStatusOrderByCreatedAtAsc(Long zoneId, DeliveryStatus status);
}
