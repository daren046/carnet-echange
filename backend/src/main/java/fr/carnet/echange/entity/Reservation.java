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

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected Reservation() {}

    public Reservation(BookCopy bookCopy, User user, int deliveryFeePaid) {
        this.bookCopy = bookCopy;
        this.user = user;
        this.deliveryFeePaid = deliveryFeePaid;
    }

    public Long getId() { return id; }
    public BookCopy getBookCopy() { return bookCopy; }
    public User getUser() { return user; }
    public Delivery getDelivery() { return delivery; }
    public int getDeliveryFeePaid() { return deliveryFeePaid; }
    public Instant getCreatedAt() { return createdAt; }

    public void setDelivery(Delivery delivery) { this.delivery = delivery; }
}
