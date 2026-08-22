package id.dekat.booking.web.dto;

import id.dekat.booking.domain.Booking;
import id.dekat.booking.domain.BookingAssignment;
import id.dekat.booking.domain.BookingItem;
import id.dekat.booking.domain.BookingStatus;
import id.dekat.booking.domain.ServiceMode;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class BookingResponse {

    private UUID id;
    private UUID tenantId;
    private UUID locationId;
    private UUID customerId;
    private String bookingCode;
    private BookingStatus status;
    private ServiceMode serviceMode;
    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;
    private ZoneId timezone;
    private String currency;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal fee;
    private BigDecimal deposit;
    private BigDecimal total;
    private Map<String, Object> policySnapshot;
    private String source;
    private UUID campaignId;
    private UUID referrerTenantId;
    private Long version;
    private OffsetDateTime createdAt;
    private OffsetDateTime confirmedAt;
    private OffsetDateTime completedAt;
    private OffsetDateTime cancelledAt;
    private List<BookingItem> items;
    private List<BookingAssignment> assignments;

    public static BookingResponse from(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.id = booking.getId();
        response.tenantId = booking.getTenantId();
        response.locationId = booking.getLocationId();
        response.customerId = booking.getCustomerId();
        response.bookingCode = booking.getBookingCode();
        response.status = booking.getStatus();
        response.serviceMode = booking.getServiceMode();
        response.startsAt = booking.getStartsAt();
        response.endsAt = booking.getEndsAt();
        response.timezone = booking.getTimezone();
        response.currency = booking.getCurrency();
        response.subtotal = booking.getSubtotal();
        response.discount = booking.getDiscount();
        response.tax = booking.getTax();
        response.fee = booking.getFee();
        response.deposit = booking.getDeposit();
        response.total = booking.getTotal();
        response.policySnapshot = booking.getPolicySnapshot();
        response.source = booking.getSource();
        response.campaignId = booking.getCampaignId();
        response.referrerTenantId = booking.getReferrerTenantId();
        response.version = booking.getVersion();
        response.createdAt = booking.getCreatedAt();
        response.confirmedAt = booking.getConfirmedAt();
        response.completedAt = booking.getCompletedAt();
        response.cancelledAt = booking.getCancelledAt();
        response.items = booking.getItems();
        response.assignments = booking.getAssignments();
        return response;
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
}
