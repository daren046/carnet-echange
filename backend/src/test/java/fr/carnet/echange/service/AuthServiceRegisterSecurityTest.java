package fr.carnet.echange.service;

import fr.carnet.echange.dto.auth.RegisterDto;
import fr.carnet.echange.enums.SchoolLevel;
import fr.carnet.echange.enums.UserRole;
import fr.carnet.echange.repository.UserRepository;
import fr.carnet.echange.repository.ZoneRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
class AuthServiceRegisterSecurityTest {

    @Autowired AuthService authService;
    @Autowired UserRepository userRepository;
    @Autowired ZoneRepository zoneRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired PhoneVerificationService phoneVerificationService;

    private RegisterDto dto(String email, UserRole role, SchoolLevel level) {
        String phone = "70" + String.format("%06d", Math.floorMod(email.hashCode(), 1_000_000));
        var sent = phoneVerificationService.sendCode(phone);
        var token = phoneVerificationService.confirm(phone, sent.debugCode()).verificationToken();
        return new RegisterDto(
                "Test", "User", email, phone, token, "secret12",
                role, level, "NORD");
    }

    @Test
    void register_rejectsDelivererRole() {
        assertThrows(IllegalArgumentException.class, () -> authService.register(
                dto("hack-livreur@test.fr", UserRole.DELIVERER, null)));
    }

    @Test
    void register_rejectsAdminRole() {
        assertThrows(IllegalArgumentException.class, () -> authService.register(
                dto("hack-admin@test.fr", UserRole.ADMIN, null)));
    }

    @Test
    void register_allowsStudentRole() {
        assertDoesNotThrow(() -> authService.register(
                dto("eleve-sec@test.fr", UserRole.STUDENT, SchoolLevel.SIXIEME)));
    }

    @Test
    void register_allowsSellerRole() {
        assertDoesNotThrow(() -> authService.register(
                dto("vendeur-sec@test.fr", UserRole.SELLER, null)));
    }
}
