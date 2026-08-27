package id.dekat.booking.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "booking_items")
public class BookingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "booking_id", nullable = false)
    private UUID bookingId;

    @Column(name = "service_id", nullable = false)
    private UUID serviceId;

    @Column(name = "staff_id")
    private UUID staffId;

    @Column(name = "resource_id")
    private UUID resourceId;

    @Column(name = "starts_at", nullable = false)
    private java.time.Instant startsAt;

    @Column(name = "ends_at", nullable = false)
    private java.time.Instant endsAt;

    @Column(name = "price", nullable = false)
    private int price;

    @Column(name = "discount", nullable = false)
    private int discount;

    @Column(name = "tax", nullable = false)
    private int tax;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private java.time.Instant createdAt;

    protected BookingItem() {}

    public BookingItem(UUID bookingId, UUID serviceId, UUID staffId, UUID resourceId,
                       java.time.Instant startsAt, java.time.Instant endsAt,
                       int price, int discount, int tax, String notes) {
        this.bookingId = bookingId;
        this.serviceId = serviceId;
        this.staffId = staffId;
        this.resourceId = resourceId;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.price = price;
        this.discount = discount;
        this.tax = tax;
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getBookingId() { return bookingId; }
    public UUID getServiceId() { return serviceId; }
    public UUID getStaffId() { return staffId; }
    public UUID getResourceId() { return resourceId; }
    public java.time.Instant getStartsAt() { return startsAt; }
    public java.time.Instant getEndsAt() { return endsAt; }
    public int getPrice() { return price; }
    public int getDiscount() { return discount; }
    public int getTax() { return tax; }
    public String getNotes() { return notes; }
    public java.time.Instant getCreatedAt() { return createdAt; }

    public java.math.BigDecimal lineTotal() {
        return java.math.BigDecimal.valueOf(price);
    }
}
