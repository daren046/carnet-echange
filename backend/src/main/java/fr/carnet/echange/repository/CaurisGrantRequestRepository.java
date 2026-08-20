package fr.carnet.echange.repository;

import fr.carnet.echange.entity.CaurisGrantRequest;
import fr.carnet.echange.enums.GrantStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CaurisGrantRequestRepository extends JpaRepository<CaurisGrantRequest, Long> {

    List<CaurisGrantRequest> findByStatusOrderByCreatedAtDesc(GrantStatus status);

    List<CaurisGrantRequest> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndStatus(Long userId, GrantStatus status);
}
