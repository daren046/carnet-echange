package fr.carnet.echange.service;

import fr.carnet.echange.dto.auth.ConfirmPhoneCodeResponse;
import fr.carnet.echange.dto.auth.SendPhoneCodeResponse;
import fr.carnet.echange.entity.PhoneVerification;
import fr.carnet.echange.repository.PhoneVerificationRepository;
import fr.carnet.echange.util.PhoneNumbers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.UUID;

@Service
public class PhoneVerificationService {

    private static final Logger log = LoggerFactory.getLogger(PhoneVerificationService.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int CODE_TTL_SECONDS = 10 * 60;
    private static final int TOKEN_TTL_SECONDS = 30 * 60;
    private static final int RESEND_COOLDOWN_SECONDS = 45;
    private static final int MAX_ATTEMPTS = 5;

    private final PhoneVerificationRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final boolean revealCode;

    public PhoneVerificationService(PhoneVerificationRepository repository,
                                    PasswordEncoder passwordEncoder,
                                    @Value("${app.otp.reveal-code:true}") boolean revealCode) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.revealCode = revealCode;
    }

    @Transactional
    public SendPhoneCodeResponse sendCode(String rawPhone) {
        String phone = requirePhone(rawPhone);
        PhoneVerification row = repository.findByPhone(phone).orElse(null);
        Instant now = Instant.now();
        if (row != null && row.getLastSentAt() != null
                && row.getLastSentAt().plusSeconds(RESEND_COOLDOWN_SECONDS).isAfter(now)) {
            throw new IllegalStateException("Un code a déjà été envoyé. Réessayez dans quelques secondes.");
        }
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        Instant expiresAt = now.plusSeconds(CODE_TTL_SECONDS);
        if (row == null) {
            row = new PhoneVerification(phone, passwordEncoder.encode(code), expiresAt);
        } else {
            row.setCodeHash(passwordEncoder.encode(code));
            row.setExpiresAt(expiresAt);
            row.setAttempts(0);
            row.setToken(null);
            row.setTokenExpiresAt(null);
        }
        row.setLastSentAt(now);
        repository.save(row);
        log.info("Code de confirmation téléphone envoyé à {} (expire dans {} s)", phone, CODE_TTL_SECONDS);
        return new SendPhoneCodeResponse(CODE_TTL_SECONDS, revealCode ? code : null);
    }

    @Transactional
    public ConfirmPhoneCodeResponse confirm(String rawPhone, String rawCode) {
        String phone = requirePhone(rawPhone);
        String code = rawCode == null ? "" : rawCode.trim();
        if (!code.matches("^[0-9]{6}$")) {
            throw new IllegalArgumentException("Indiquez le code à 6 chiffres reçu");
        }
        PhoneVerification row = repository.findByPhone(phone)
                .orElseThrow(() -> new IllegalArgumentException("Demandez d’abord un code pour ce numéro"));
        Instant now = Instant.now();
        if (row.getExpiresAt() == null || row.getExpiresAt().isBefore(now)) {
            throw new IllegalArgumentException("Ce code a expiré. Demandez-en un nouveau.");
        }
        if (row.getAttempts() >= MAX_ATTEMPTS) {
            throw new IllegalStateException("Trop d’essais. Demandez un nouveau code.");
        }
        row.setAttempts(row.getAttempts() + 1);
        if (!passwordEncoder.matches(code, row.getCodeHash())) {
            repository.save(row);
            throw new IllegalArgumentException("Code incorrect");
        }
        String token = UUID.randomUUID().toString();
        row.setToken(token);
        row.setTokenExpiresAt(now.plusSeconds(TOKEN_TTL_SECONDS));
        row.setAttempts(0);
        repository.save(row);
        return new ConfirmPhoneCodeResponse(token);
    }

    public String requireVerified(String rawPhone, String token) {
        String phone = requirePhone(rawPhone);
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Confirmez d’abord votre numéro avec le code reçu");
        }
        PhoneVerification row = repository.findByPhone(phone)
                .orElseThrow(() -> new IllegalArgumentException("Confirmez d’abord votre numéro avec le code reçu"));
        Instant now = Instant.now();
        if (row.getToken() == null || !row.getToken().equals(token)
                || row.getTokenExpiresAt() == null || row.getTokenExpiresAt().isBefore(now)) {
            throw new IllegalArgumentException("Le numéro n’est pas confirmé. Renvoyez un code.");
        }
        return phone;
    }

    private static String requirePhone(String rawPhone) {
        String phone = PhoneNumbers.normalize(rawPhone);
        if (phone == null) {
            throw new IllegalArgumentException("Indiquez un numéro de téléphone valide");
        }
        return phone;
    }
}
