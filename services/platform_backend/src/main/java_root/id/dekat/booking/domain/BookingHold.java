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
    @Column(name = "id")
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "location_id", nullable = false)
    private UUID locationId;

    @Column(name = "service_id", nullable = false)
    private UUID serviceId;

    @Column(name = "staff_id")
    private UUID staffId;

    @Column(name = "resource_id")
    private UUID resourceId;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "starts_at", nullable = false)
    private OffsetDateTime startsAt;

    @Column(name = "ends_at", nullable = false)
    private OffsetDateTime endsAt;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
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
