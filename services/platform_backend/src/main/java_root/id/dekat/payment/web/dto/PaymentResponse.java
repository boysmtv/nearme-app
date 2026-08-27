package id.dekat.payment.web.dto;

import id.dekat.payment.domain.PaymentIntent;
import id.dekat.payment.domain.PaymentStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public class PaymentResponse {

    private UUID id;
    private UUID bookingId;
    private UUID tenantId;
    private Integer amount;
    private String currency;
    private String method;
    private PaymentStatus status;
    private String gatewayReference;
    private OffsetDateTime expiresAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static PaymentResponse from(PaymentIntent intent) {
        PaymentResponse response = new PaymentResponse();
        response.id = intent.getId();
        response.bookingId = intent.getBookingId();
        response.tenantId = intent.getTenantId();
        response.amount = intent.getAmount();
        response.currency = intent.getCurrency();
        response.method = intent.getMethod();
        response.status = intent.getStatus();
        response.gatewayReference = intent.getGatewayReference();
        response.expiresAt = intent.getExpiresAt();
        response.createdAt = intent.getCreatedAt();
        response.updatedAt = intent.getUpdatedAt();
        return response;
    }

    public UUID getId() { return id; }
    public UUID getBookingId() { return bookingId; }
    public UUID getTenantId() { return tenantId; }
    public Integer getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getMethod() { return method; }
    public PaymentStatus getStatus() { return status; }
    public String getGatewayReference() { return gatewayReference; }
    public OffsetDateTime getExpiresAt() { return expiresAt; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
