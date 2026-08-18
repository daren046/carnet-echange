package fr.carnet.echange.entity;

import fr.carnet.echange.enums.NotificationType;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    private String link;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected Notification() {}

    public Notification(User user, NotificationType type, String title, String message, String link) {
        this.user = user;
        this.type = type;
        this.title = title;
        this.message = message;
        this.link = link;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public NotificationType getType() { return type; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getLink() { return link; }
    public boolean isRead() { return read; }
    public Instant getCreatedAt() { return createdAt; }

    public void markRead() { this.read = true; }
}
