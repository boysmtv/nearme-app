package id.dekat.booking.web.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public class CreateBookingRequest {

    @NotNull
    private UUID holdId;

    @NotNull
    private UUID tenantId;

    @NotNull
    private UUID locationId;

    @NotNull
    private UUID customerId;

    @NotNull
    private String currency;

    private String idempotencyKey;

    private String contactInfo;

    private String paymentMethod;

    private String notes;

    private List<BookingItemRequest> items;

    public UUID getHoldId() { return holdId; }
    public void setHoldId(UUID holdId) { this.holdId = holdId; }
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public UUID getLocationId() { return locationId; }
    public void setLocationId(UUID locationId) { this.locationId = locationId; }
    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<BookingItemRequest> getItems() { return items; }
    public void setItems(List<BookingItemRequest> items) { this.items = items; }
}
