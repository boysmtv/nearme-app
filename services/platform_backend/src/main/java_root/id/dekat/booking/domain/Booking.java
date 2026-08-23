package id.dekat.booking.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private UUID locationId;

    @Column(nullable = false)
    private UUID customerId;

    @Column(nullable = false, unique = true)
    private String bookingCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceMode serviceMode;

    @Column(nullable = false)
    private OffsetDateTime startsAt;

    private OffsetDateTime endsAt;

    @Column(nullable = false)
    private ZoneId timezone;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal tax = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal fee = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal deposit = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(columnDefinition = "jsonb")
    @Convert(converter = id.dekat.common.JsonbMapConverter.class)
    private Map<String, Object> policySnapshot = new HashMap<>();

    private String source;

    private UUID campaignId;

    private UUID referrerTenantId;

    @Version
    private Long version;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    private OffsetDateTime confirmedAt;
    private OffsetDateTime completedAt;
    private OffsetDateTime cancelledAt;

    @OneToMany(mappedBy = "bookingId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BookingItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "bookingId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BookingAssignment> assignments = new ArrayList<>();

    protected Booking() {}

    public Booking(UUID tenantId, UUID locationId, UUID customerId,
                   String bookingCode, ServiceMode serviceMode,
                   OffsetDateTime startsAt, OffsetDateTime endsAt,
                   ZoneId timezone, String currency) {
        this.tenantId = tenantId;
        this.locationId = locationId;
        this.customerId = customerId;
        this.bookingCode = bookingCode;
        this.status = BookingStatus.HELD;
        this.serviceMode = serviceMode;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.timezone = timezone;
        this.currency = currency;
        this.createdAt = OffsetDateTime.now();
    }

    public void confirm() {
        if (this.status != BookingStatus.HELD && this.status != BookingStatus.PENDING_PAYMENT) {
            throw new IllegalStateException("Cannot confirm booking in status: " + this.status);
        }
        this.status = BookingStatus.CONFIRMED;
        this.confirmedAt = OffsetDateTime.now();
    }

    public void cancel() {
        if (this.status == BookingStatus.COMPLETED || this.status == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Cannot cancel booking in status: " + this.status);
        }
        this.status = BookingStatus.CANCELLED;
        this.cancelledAt = OffsetDateTime.now();
    }

    public void checkIn() {
        if (this.status != BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot check in booking in status: " + this.status);
        }
        this.status = BookingStatus.CHECKED_IN;
    }

    public void startService() {
        if (this.status != BookingStatus.CHECKED_IN && this.status != BookingStatus.EN_ROUTE) {
            throw new IllegalStateException("Cannot start service in status: " + this.status);
        }
        this.status = BookingStatus.IN_SERVICE;
    }

    public void complete() {
        if (this.status != BookingStatus.IN_SERVICE) {
            throw new IllegalStateException("Cannot complete booking in status: " + this.status);
        }
        this.status = BookingStatus.COMPLETED;
        this.completedAt = OffsetDateTime.now();
    }

    public void noShow() {
        if (this.status != BookingStatus.CONFIRMED && this.status != BookingStatus.CHECKED_IN) {
            throw new IllegalStateException("Cannot record no-show in status: " + this.status);
        }
        this.status = BookingStatus.NO_SHOW;
    }

    public void reschedule(OffsetDateTime newStartsAt, OffsetDateTime newEndsAt) {
        if (this.status == BookingStatus.COMPLETED || this.status == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Cannot reschedule booking in status: " + this.status);
        }
        this.startsAt = newStartsAt;
        this.endsAt = newEndsAt;
    }

    public void recalculateTotal() {
        this.subtotal = items.stream()
                .map(BookingItem::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.total = subtotal.subtract(discount).add(tax).add(fee);
    }

    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public UUID getLocationId() { return locationId; }
    public UUID getCustomerId() { return customerId; }
    public String getBookingCode() { return bookingCode; }
    public BookingStatus getStatus() { return status; }
    public ServiceMode getServiceMode() { return serviceMode; }
    public OffsetDateTime getStartsAt() { return startsAt; }
    public OffsetDateTime getEndsAt() { return endsAt; }
    public ZoneId getTimezone() { return timezone; }
    public String getCurrency() { return currency; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getDiscount() { return discount; }
    public BigDecimal getTax() { return tax; }
    public BigDecimal getFee() { return fee; }
    public BigDecimal getDeposit() { return deposit; }
    public BigDecimal getTotal() { return total; }
    public Map<String, Object> getPolicySnapshot() { return policySnapshot; }
    public String getSource() { return source; }
    public UUID getCampaignId() { return campaignId; }
    public UUID getReferrerTenantId() { return referrerTenantId; }
    public Long getVersion() { return version; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getConfirmedAt() { return confirmedAt; }
    public OffsetDateTime getCompletedAt() { return completedAt; }
    public OffsetDateTime getCancelledAt() { return cancelledAt; }
    public List<BookingItem> getItems() { return items; }
    public List<BookingAssignment> getAssignments() { return assignments; }

    public void setItems(List<BookingItem> items) { this.items = items; }
    public void setAssignments(List<BookingAssignment> assignments) { this.assignments = assignments; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }
    public void setSource(String source) { this.source = source; }
    public void setCampaignId(UUID campaignId) { this.campaignId = campaignId; }
    public void setReferrerTenantId(UUID referrerTenantId) { this.referrerTenantId = referrerTenantId; }
    public void setPolicySnapshot(Map<String, Object> policySnapshot) { this.policySnapshot = policySnapshot; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }
    public void setTax(BigDecimal tax) { this.tax = tax; }
    public void setFee(BigDecimal fee) { this.fee = fee; }
    public void setDeposit(BigDecimal deposit) { this.deposit = deposit; }
    public void setTotal(BigDecimal total) { this.total = total; }
}
