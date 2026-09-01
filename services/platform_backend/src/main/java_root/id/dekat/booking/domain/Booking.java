package id.dekat.booking.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
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
    @Column(name = "id")
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "location_id", nullable = false)
    private UUID locationId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "booking_code", nullable = false, unique = true)
    private String bookingCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BookingStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_mode", nullable = false)
    private ServiceMode serviceMode;

    @Column(name = "starts_at", nullable = false)
    private OffsetDateTime startsAt;

    @Column(name = "ends_at")
    private OffsetDateTime endsAt;

    @Column(name = "timezone", nullable = false)
    private ZoneId timezone;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Column(name = "subtotal", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "discount", precision = 12, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "tax", precision = 12, scale = 2)
    private BigDecimal tax = BigDecimal.ZERO;

    @Column(name = "fee", precision = 12, scale = 2)
    private BigDecimal fee = BigDecimal.ZERO;

    @Column(name = "deposit", precision = 12, scale = 2)
    private BigDecimal deposit = BigDecimal.ZERO;

    @Column(name = "total", nullable = false, precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "policy_snapshot")
    private Map<String, Object> policySnapshot = new HashMap<>();

    @Column(name = "confirmation_pin")
    private String confirmationPin;

    @Column(name = "pin_verified", nullable = false)
    private Boolean pinVerified = false;

    @Column(name = "deposit_amount", nullable = false)
    private Integer depositAmount = 0;

    @Column(name = "deposit_required", nullable = false)
    private Boolean depositRequired = false;

    @Column(name = "cancel_deadline")
    private OffsetDateTime cancelDeadline;

    @Column(name = "reschedule_count", nullable = false)
    private Integer rescheduleCount = 0;

    @Column(name = "max_reschedule", nullable = false)
    private Integer maxReschedule = 1;

    @Column(name = "cancel_policy")
    private String cancelPolicy;

    @Column(name = "source")
    private String source;

    @Column(name = "campaign_id")
    private UUID campaignId;

    @Column(name = "referrer_tenant_id")
    private UUID referrerTenantId;

    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "confirmed_at")
    private OffsetDateTime confirmedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "cancelled_at")
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
    public String getConfirmationPin() { return confirmationPin; }
    public void setConfirmationPin(String confirmationPin) { this.confirmationPin = confirmationPin; }
    public Boolean getPinVerified() { return pinVerified; }
    public void setPinVerified(Boolean pinVerified) { this.pinVerified = pinVerified; }
    public Integer getDepositAmount() { return depositAmount; }
    public void setDepositAmount(Integer depositAmount) { this.depositAmount = depositAmount; }
    public Boolean getDepositRequired() { return depositRequired; }
    public void setDepositRequired(Boolean depositRequired) { this.depositRequired = depositRequired; }
    public OffsetDateTime getCancelDeadline() { return cancelDeadline; }
    public void setCancelDeadline(OffsetDateTime cancelDeadline) { this.cancelDeadline = cancelDeadline; }
    public Integer getRescheduleCount() { return rescheduleCount; }
    public void setRescheduleCount(Integer rescheduleCount) { this.rescheduleCount = rescheduleCount; }
    public Integer getMaxReschedule() { return maxReschedule; }
    public void setMaxReschedule(Integer maxReschedule) { this.maxReschedule = maxReschedule; }
    public String getCancelPolicy() { return cancelPolicy; }
    public void setCancelPolicy(String cancelPolicy) { this.cancelPolicy = cancelPolicy; }
}
