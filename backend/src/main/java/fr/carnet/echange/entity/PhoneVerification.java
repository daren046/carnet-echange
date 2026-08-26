package fr.carnet.echange.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "phone_verifications")
public class PhoneVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column(nullable = false)
    private String codeHash;

    @Column(nullable = false)
    private Instant expiresAt = Instant.now();

    @Column(nullable = false)
    private Instant lastSentAt = Instant.now();

    @Column(nullable = false)
    private int attempts = 0;

    private String token;

    private Instant tokenExpiresAt;

    protected PhoneVerification() {}

    public PhoneVerification(String phone, String codeHash, Instant expiresAt) {
        this.phone = phone;
        this.codeHash = codeHash;
        this.expiresAt = expiresAt;
        this.lastSentAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getPhone() { return phone; }
    public String getCodeHash() { return codeHash; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getLastSentAt() { return lastSentAt; }
    public int getAttempts() { return attempts; }
    public String getToken() { return token; }
    public Instant getTokenExpiresAt() { return tokenExpiresAt; }

    public void setCodeHash(String codeHash) { this.codeHash = codeHash; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public void setLastSentAt(Instant lastSentAt) { this.lastSentAt = lastSentAt; }
    public void setAttempts(int attempts) { this.attempts = attempts; }
    public void setToken(String token) { this.token = token; }
    public void setTokenExpiresAt(Instant tokenExpiresAt) { this.tokenExpiresAt = tokenExpiresAt; }
}
