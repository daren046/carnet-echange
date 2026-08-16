package fr.carnet.echange.entity;

import fr.carnet.echange.enums.TransactionType;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    private int stampDelta;

    private int amount;

    @ManyToOne(fetch = FetchType.LAZY)
    private BookCopy bookCopy;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected Transaction() {}

    public Transaction(User user, TransactionType type, int stampDelta, int amount,
                       BookCopy bookCopy, String description) {
        this.user = user;
        this.type = type;
        this.stampDelta = stampDelta;
        this.amount = amount;
        this.bookCopy = bookCopy;
        this.description = description;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public TransactionType getType() { return type; }
    public int getStampDelta() { return stampDelta; }
    public int getAmount() { return amount; }
    public BookCopy getBookCopy() { return bookCopy; }
    public String getDescription() { return description; }
    public Instant getCreatedAt() { return createdAt; }
}
