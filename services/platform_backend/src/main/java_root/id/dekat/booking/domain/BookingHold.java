package id.dekat.booking.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "booking_holds")
public class BookingHold {

    public enum HoldStatus {
        ACTIVE, EXPIRED, CONVERTED, CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private UUID locationId;

    @Column(nullable = false)
    private UUID serviceId;

    private UUID staffId;
    private UUID resourceId;
    private UUID customerId;

    @Column(nullable = false)
    private OffsetDateTime startsAt;

    @Column(nullable = false)
    private OffsetDateTime endsAt;

    @Column(nullable = false)
    private OffsetDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HoldStatus status;

    protected BookingHold() {}

    public BookingHold(UUID tenantId, UUID locationId, UUID serviceId,
                       UUID staffId, UUID resourceId, UUID customerId,
                       OffsetDateTime startsAt, OffsetDateTime endsAt,
                       OffsetDateTime expiresAt) {
        this.tenantId = tenantId;
        this.locationId = locationId;
        this.serviceId = serviceId;
        this.staffId = staffId;
        this.resourceId = resourceId;
        this.customerId = customerId;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.expiresAt = expiresAt;
        this.status = HoldStatus.ACTIVE;
    }

    public boolean isExpired() {
        return OffsetDateTime.now().isAfter(expiresAt);
    }

    public void markExpired() { this.status = HoldStatus.EXPIRED; }
    public void markConverted() { this.status = HoldStatus.CONVERTED; }
    public void markCancelled() { this.status = HoldStatus.CANCELLED; }

    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public UUID getLocationId() { return locationId; }
    public UUID getServiceId() { return serviceId; }
    public UUID getStaffId() { return staffId; }
    public UUID getResourceId() { return resourceId; }
    public UUID getCustomerId() { return customerId; }
    public OffsetDateTime getStartsAt() { return startsAt; }
    public OffsetDateTime getEndsAt() { return endsAt; }
    public OffsetDateTime getExpiresAt() { return expiresAt; }
    public HoldStatus getStatus() { return status; }
}
