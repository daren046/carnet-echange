package fr.carnet.echange.repository;

import fr.carnet.echange.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Reservation> findByIdAndUserId(Long id, Long userId);
}
