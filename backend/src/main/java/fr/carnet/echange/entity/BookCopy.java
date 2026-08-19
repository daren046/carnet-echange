package fr.carnet.echange.entity;

import fr.carnet.echange.enums.BookCondition;
import fr.carnet.echange.enums.CopyStatus;
import fr.carnet.echange.enums.ListingCategory;
import fr.carnet.echange.enums.OfferType;
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

    /** BOOKS (manuels) ou DECOR (intérieur). Null = anciens enregistrements traités comme BOOKS. */
    @Enumerated(EnumType.STRING)
    private ListingCategory listingCategory = ListingCategory.BOOKS;

    /** Si vrai, le nom du déposant n'est pas affiché publiquement. */
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean anonymous = false;

    /** Contact du déposant sans compte — pour le joindre directement, sans passer par l’équipe. */
    private String contactName;
    private String contactPhone;
    private String contactEmail;

    /** Échange, don ou vente. Null = anciens enregistrements, traités comme EXCHANGE. */
    @Enumerated(EnumType.STRING)
    private OfferType offerType = OfferType.EXCHANGE;

    /** Prix attendu (FCFA) pour une vente — interne, non affiché au public. */
    private Integer expectedPrice;

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
        this.listingCategory = ListingCategory.BOOKS;
        this.anonymous = false;
        this.offerType = OfferType.EXCHANGE;
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
    public ListingCategory getListingCategory() {
        return listingCategory != null ? listingCategory : ListingCategory.BOOKS;
    }
    public boolean isAnonymous() { return anonymous; }
    public String getContactName() { return contactName; }
    public String getContactPhone() { return contactPhone; }
    public String getContactEmail() { return contactEmail; }
    public OfferType getOfferType() {
        return offerType != null ? offerType : OfferType.EXCHANGE;
    }
    public Integer getExpectedPrice() { return expectedPrice; }
    public User getReservedBy() { return reservedBy; }
    public Instant getCreatedAt() { return createdAt; }

    public void setStatus(CopyStatus status) { this.status = status; }
    public void setReservedBy(User reservedBy) { this.reservedBy = reservedBy; }
    public void setListingCategory(ListingCategory listingCategory) { this.listingCategory = listingCategory; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }
    public void setZone(Zone zone) { this.zone = zone; }
    public void setContactName(String contactName) { this.contactName = contactName; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public void setOfferType(OfferType offerType) { this.offerType = offerType; }
    public void setExpectedPrice(Integer expectedPrice) { this.expectedPrice = expectedPrice; }
}
