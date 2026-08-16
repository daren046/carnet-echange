package fr.carnet.echange.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "library_loans")
public class LibraryLoan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    private BookCopy bookCopy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    private User borrower;

    @Column(nullable = false)
    private int depositAmount;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private Instant borrowedAt = Instant.now();

    private Instant returnedAt;

    protected LibraryLoan() {}

    public LibraryLoan(BookCopy bookCopy, User borrower, int depositAmount) {
        this.bookCopy = bookCopy;
        this.borrower = borrower;
        this.depositAmount = depositAmount;
    }

    public Long getId() { return id; }
    public BookCopy getBookCopy() { return bookCopy; }
    public User getBorrower() { return borrower; }
    public int getDepositAmount() { return depositAmount; }
    public boolean isActive() { return active; }
    public Instant getBorrowedAt() { return borrowedAt; }
    public Instant getReturnedAt() { return returnedAt; }

    public void setActive(boolean active) { this.active = active; }
    public void setReturnedAt(Instant returnedAt) { this.returnedAt = returnedAt; }
}
