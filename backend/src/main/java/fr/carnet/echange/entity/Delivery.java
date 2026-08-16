package fr.carnet.echange.entity;

import fr.carnet.echange.enums.DeliveryStatus;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "deliveries")
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    private Zone zone;

    @ManyToOne(fetch = FetchType.EAGER)
    private User deliverer;

    @OneToMany(mappedBy = "delivery", cascade = CascadeType.ALL)
    private List<Reservation> reservations = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status = DeliveryStatus.PENDING;

    @Column(nullable = false)
    private int deliveryFee;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected Delivery() {}

    public Delivery(Zone zone, int deliveryFee) {
        this.zone = zone;
        this.deliveryFee = deliveryFee;
    }

    public Long getId() { return id; }
    public Zone getZone() { return zone; }
    public User getDeliverer() { return deliverer; }
    public List<Reservation> getReservations() { return reservations; }
    public DeliveryStatus getStatus() { return status; }
    public int getDeliveryFee() { return deliveryFee; }
    public Instant getCreatedAt() { return createdAt; }

    public void setDeliverer(User deliverer) { this.deliverer = deliverer; }
    public void setStatus(DeliveryStatus status) { this.status = status; }
}
