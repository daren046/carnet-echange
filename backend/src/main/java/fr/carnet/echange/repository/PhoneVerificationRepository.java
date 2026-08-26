package fr.carnet.echange.repository;

import fr.carnet.echange.entity.PhoneVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PhoneVerificationRepository extends JpaRepository<PhoneVerification, Long> {
    Optional<PhoneVerification> findByPhone(String phone);
    Optional<PhoneVerification> findByToken(String token);
}
