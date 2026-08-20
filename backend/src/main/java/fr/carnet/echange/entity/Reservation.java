package fr.carnet.echange.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    private BookCopy bookCopy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    private Delivery delivery;

    @Column(nullable = false)
    private int deliveryFeePaid;

    @Column(nullable = false, columnDefinition = "integer default 1")
    private int caurisSpent = 1;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected Reservation() {}

    public Reservation(BookCopy bookCopy, User user, int deliveryFeePaid, int caurisSpent) {
        this.bookCopy = bookCopy;
        this.user = user;
        this.deliveryFeePaid = deliveryFeePaid;
        this.caurisSpent = caurisSpent < 1 ? 1 : caurisSpent;
    }

    public Long getId() { return id; }
    public BookCopy getBookCopy() { return bookCopy; }
    public User getUser() { return user; }
    public Delivery getDelivery() { return delivery; }
    public int getDeliveryFeePaid() { return deliveryFeePaid; }
    public int getCaurisSpent() { return caurisSpent < 1 ? 1 : caurisSpent; }
    public Instant getCreatedAt() { return createdAt; }

    public void setDelivery(Delivery delivery) { this.delivery = delivery; }
}
