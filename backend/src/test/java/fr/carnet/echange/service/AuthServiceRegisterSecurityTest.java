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

import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
class AuthServiceRegisterSecurityTest {

    @Autowired AuthService authService;
    @Autowired UserRepository userRepository;
    @Autowired ZoneRepository zoneRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @Test
    void register_rejectsDelivererRole() {
        RegisterDto dto = new RegisterDto(
                "Test", "Livreur", "hack-livreur@test.fr", "secret12",
                UserRole.DELIVERER, null, "NORD");

        assertThrows(IllegalArgumentException.class, () -> authService.register(dto));
    }

    @Test
    void register_rejectsAdminRole() {
        RegisterDto dto = new RegisterDto(
                "Test", "Admin", "hack-admin@test.fr", "secret12",
                UserRole.ADMIN, null, "NORD");

        assertThrows(IllegalArgumentException.class, () -> authService.register(dto));
    }

    @Test
    void register_allowsStudentRole() {
        RegisterDto dto = new RegisterDto(
                "Test", "Eleve", "eleve-sec@test.fr", "secret12",
                UserRole.STUDENT, SchoolLevel.SIXIEME, "NORD");

        authService.register(dto);
    }
}
