package fr.carnet.echange.service;

import fr.carnet.echange.dto.auth.AuthResponse;
import fr.carnet.echange.dto.auth.LoginDto;
import fr.carnet.echange.dto.auth.RegisterDto;
import fr.carnet.echange.dto.auth.UpdateProfileDto;
import fr.carnet.echange.dto.auth.UserMeDto;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.entity.Zone;
import fr.carnet.echange.enums.NotificationType;
import fr.carnet.echange.enums.UserRole;
import fr.carnet.echange.repository.UserRepository;
import fr.carnet.echange.repository.ZoneRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ZoneRepository zoneRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final StampService stampService;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository, ZoneRepository zoneRepository,
                       PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                       JwtService jwtService, StampService stampService,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.zoneRepository = zoneRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.stampService = stampService;
        this.notificationService = notificationService;
    }

    @Transactional
    public User register(RegisterDto dto) {
        userRepository.findByEmail(dto.email()).ifPresent(u -> {
            throw new IllegalArgumentException("Cet email est déjà utilisé");
        });

        Zone zone = zoneRepository.findByCode(dto.zoneCode())
                .orElseThrow(() -> new IllegalArgumentException("Zone inconnue : " + dto.zoneCode()));

        if (dto.role() != UserRole.STUDENT && dto.role() != UserRole.PARENT) {
            throw new IllegalArgumentException("Seuls les profils Élève et Parent sont autorisés à l'inscription");
        }

        User user = new User(
                dto.firstName(),
                dto.lastName(),
                dto.email(),
                passwordEncoder.encode(dto.password()),
                dto.role(),
                dto.schoolLevel(),
                zone
        );
        user = userRepository.save(user);
        stampService.grantWelcomeBonus(user);
        notificationService.notify(user, NotificationType.WELCOME,
                "Bienvenue sur Carnet d'Échange",
                "Vous avez reçu 1 tampon de bienvenue. Déposez un manuel ou parcourez le catalogue.",
                "/catalog");
        return user;
    }

    public AuthResponse login(LoginDto dto) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.email(), dto.password()));
        User user = (User) auth.getPrincipal();
        return new AuthResponse(
                jwtService.generateAccessToken(user.getUsername()),
                jwtService.generateRefreshToken(user.getUsername())
        );
    }

    public UserMeDto getCurrentUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return toUserMeDto(user);
    }

    @Transactional
    public UserMeDto updateProfile(User user, UpdateProfileDto dto) {
        Zone zone = zoneRepository.findByCode(dto.zoneCode())
                .orElseThrow(() -> new IllegalArgumentException("Zone inconnue : " + dto.zoneCode()));

        user.setFirstName(dto.firstName().trim());
        user.setLastName(dto.lastName().trim());
        user.setZone(zone);
        if (user.getRole() == UserRole.STUDENT || user.getRole() == UserRole.PARENT) {
            user.setSchoolLevel(dto.schoolLevel());
        }

        if (dto.newPassword() != null && !dto.newPassword().isBlank()) {
            if (dto.newPassword().length() < 6) {
                throw new IllegalArgumentException("Le mot de passe doit contenir au moins 6 caractères");
            }
            if (dto.currentPassword() == null || !passwordEncoder.matches(dto.currentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Mot de passe actuel incorrect");
            }
            user.setPassword(passwordEncoder.encode(dto.newPassword()));
        }

        return toUserMeDto(userRepository.save(user));
    }

    public UserMeDto toUserMeDto(User user) {
        return new UserMeDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getSchoolLevel(),
                user.getZone() != null ? user.getZone().getId() : null,
                user.getZone() != null ? user.getZone().getName() : null,
                user.getZone() != null ? user.getZone().getCode() : null,
                user.getStampBalance(),
                user.getDepositBalance(),
                user.getWalletBalance()
        );
    }
}
