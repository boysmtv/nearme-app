package id.dekat.booking.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.UUID;

@Entity
@Table(name = "booking_items")
public class BookingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID bookingId;

    @Column(nullable = false)
    private UUID serviceId;

    private UUID variantId;

    @Column(nullable = false)
    private String nameSnapshot;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal priceSnapshot;

    private Duration durationSnapshot;

    @Column(nullable = false)
    private int quantity;

    protected BookingItem() {}

    public BookingItem(UUID bookingId, UUID serviceId, UUID variantId,
                       String nameSnapshot, BigDecimal priceSnapshot,
                       Duration durationSnapshot, int quantity) {
        this.bookingId = bookingId;
        this.serviceId = serviceId;
        this.variantId = variantId;
        this.nameSnapshot = nameSnapshot;
        this.priceSnapshot = priceSnapshot;
        this.durationSnapshot = durationSnapshot;
        this.quantity = quantity;
    }

    public BigDecimal lineTotal() {
        return priceSnapshot.multiply(BigDecimal.valueOf(quantity));
    }

    public UUID getId() { return id; }
    public UUID getBookingId() { return bookingId; }
    public UUID getServiceId() { return serviceId; }
    public UUID getVariantId() { return variantId; }
    public String getNameSnapshot() { return nameSnapshot; }
    public BigDecimal getPriceSnapshot() { return priceSnapshot; }
    public Duration getDurationSnapshot() { return durationSnapshot; }
    public int getQuantity() { return quantity; }
}
