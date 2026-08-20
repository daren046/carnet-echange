package fr.carnet.echange.entity;

import fr.carnet.echange.enums.GrantStatus;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "cauris_grant_requests")
public class CaurisGrantRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    private User user;

    @Column(nullable = false, length = 500)
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GrantStatus status = GrantStatus.PENDING;

    private Integer amountGranted;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    private Instant decidedAt;

    protected CaurisGrantRequest() {}

    public CaurisGrantRequest(User user, String note) {
        this.user = user;
        this.note = note;
        this.status = GrantStatus.PENDING;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getNote() { return note; }
    public GrantStatus getStatus() { return status; }
    public Integer getAmountGranted() { return amountGranted; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getDecidedAt() { return decidedAt; }

    public void approve(int amount) {
        this.status = GrantStatus.APPROVED;
        this.amountGranted = amount;
        this.decidedAt = Instant.now();
    }

    public void reject() {
        this.status = GrantStatus.REJECTED;
        this.decidedAt = Instant.now();
    }
}
