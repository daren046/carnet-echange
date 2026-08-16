package fr.carnet.echange.entity;

import fr.carnet.echange.enums.BookCondition;
import fr.carnet.echange.enums.CopyStatus;
import fr.carnet.echange.enums.SchoolLevel;
import fr.carnet.echange.enums.Subject;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "book_copies")
public class BookCopy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Subject subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SchoolLevel level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookCondition condition;

    @Column(nullable = false)
    private String photoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private User depositor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    private Zone zone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CopyStatus status = CopyStatus.AVAILABLE;

    @Column(nullable = false)
    private boolean libraryMode = false;

    @ManyToOne(fetch = FetchType.LAZY)
    private User reservedBy;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected BookCopy() {}

    public BookCopy(String title, Subject subject, SchoolLevel level, BookCondition condition,
                    String photoUrl, User depositor, Zone zone, boolean libraryMode) {
        this.title = title;
        this.subject = subject;
        this.level = level;
        this.condition = condition;
        this.photoUrl = photoUrl;
        this.depositor = depositor;
        this.zone = zone;
        this.libraryMode = libraryMode;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public Subject getSubject() { return subject; }
    public SchoolLevel getLevel() { return level; }
    public BookCondition getCondition() { return condition; }
    public String getPhotoUrl() { return photoUrl; }
    public User getDepositor() { return depositor; }
    public Zone getZone() { return zone; }
    public CopyStatus getStatus() { return status; }
    public boolean isLibraryMode() { return libraryMode; }
    public User getReservedBy() { return reservedBy; }
    public Instant getCreatedAt() { return createdAt; }

    public void setStatus(CopyStatus status) { this.status = status; }
    public void setReservedBy(User reservedBy) { this.reservedBy = reservedBy; }
}
