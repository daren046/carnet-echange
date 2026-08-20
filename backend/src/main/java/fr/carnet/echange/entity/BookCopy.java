package fr.carnet.echange.entity;

import fr.carnet.echange.enums.BookCondition;
import fr.carnet.echange.enums.CopyStatus;
import fr.carnet.echange.enums.ExtraCaurisStatus;
import fr.carnet.echange.enums.ListingCategory;
import fr.carnet.echange.enums.ListingKind;
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

    @Column
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

    /** True une fois le cauris de dépôt crédité après validation de l’état. */
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean caurisCredited = false;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean extraCaurisRequested = false;

    @Column(length = 500)
    private String extraCaurisNote;

    /** Null = anciens enregistrements, traités comme NONE. */
    @Enumerated(EnumType.STRING)
    private ExtraCaurisStatus extraCaurisStatus = ExtraCaurisStatus.NONE;

    private Integer extraCaurisAmount;

    /** OFFER = je propose un article. WANTED = je cherche un article. Null = anciens enregistrements traités comme OFFER. */
    @Enumerated(EnumType.STRING)
    private ListingKind listingKind = ListingKind.OFFER;

    @Column(length = 1000)
    private String description;

    /** Nombre de cauris à débiter au retrait. Null / 0 = 1. */
    @Column(nullable = false, columnDefinition = "integer default 1")
    private int pickupCaurisCost = 1;

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
        this.listingKind = ListingKind.OFFER;
        this.extraCaurisStatus = ExtraCaurisStatus.NONE;
        this.pickupCaurisCost = 1;
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
    public boolean isCaurisCredited() { return caurisCredited; }
    public boolean isExtraCaurisRequested() { return extraCaurisRequested; }
    public String getExtraCaurisNote() { return extraCaurisNote; }
    public ExtraCaurisStatus getExtraCaurisStatus() {
        return extraCaurisStatus != null ? extraCaurisStatus : ExtraCaurisStatus.NONE;
    }
    public Integer getExtraCaurisAmount() { return extraCaurisAmount; }
    public ListingKind getListingKind() {
        return listingKind != null ? listingKind : ListingKind.OFFER;
    }
    public String getDescription() { return description; }
    public int getPickupCaurisCost() { return pickupCaurisCost < 1 ? 1 : pickupCaurisCost; }
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
    public void setCaurisCredited(boolean caurisCredited) { this.caurisCredited = caurisCredited; }
    public void setExtraCaurisRequested(boolean extraCaurisRequested) { this.extraCaurisRequested = extraCaurisRequested; }
    public void setExtraCaurisNote(String extraCaurisNote) { this.extraCaurisNote = extraCaurisNote; }
    public void setExtraCaurisStatus(ExtraCaurisStatus extraCaurisStatus) { this.extraCaurisStatus = extraCaurisStatus; }
    public void setExtraCaurisAmount(Integer extraCaurisAmount) { this.extraCaurisAmount = extraCaurisAmount; }
    public void setListingKind(ListingKind listingKind) { this.listingKind = listingKind; }
    public void setDescription(String description) { this.description = description; }
    public void setPickupCaurisCost(int pickupCaurisCost) {
        this.pickupCaurisCost = pickupCaurisCost < 1 ? 1 : pickupCaurisCost;
    }
}
