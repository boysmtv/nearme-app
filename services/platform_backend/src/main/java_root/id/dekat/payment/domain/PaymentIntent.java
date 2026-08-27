package id.dekat.payment.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_intents")
public class PaymentIntent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "booking_id", nullable = false)
    private UUID bookingId;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Column(name = "method")
    private String method;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status;

    @Column(name = "gateway_reference")
    private String gatewayReference;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected PaymentIntent() {}

    public PaymentIntent(UUID bookingId, UUID tenantId, Integer amount,
                         String currency, String method, OffsetDateTime expiresAt) {
        this.bookingId = bookingId;
        this.tenantId = tenantId;
        this.amount = amount;
        this.currency = currency;
        this.method = method;
        this.status = PaymentStatus.PENDING;
        this.expiresAt = expiresAt;
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    public void markAuthorized(String gatewayReference) {
        this.status = PaymentStatus.AUTHORIZED;
        this.gatewayReference = gatewayReference;
        this.updatedAt = OffsetDateTime.now();
    }

    public void markCaptured() {
        this.status = PaymentStatus.CAPTURED;
        this.updatedAt = OffsetDateTime.now();
    }

    public void markFailed() {
        this.status = PaymentStatus.FAILED;
        this.updatedAt = OffsetDateTime.now();
    }

    public void markCancelled() {
        this.status = PaymentStatus.CANCELLED;
        this.updatedAt = OffsetDateTime.now();
    }

    public void markRefunded() {
        this.status = PaymentStatus.REFUNDED;
        this.updatedAt = OffsetDateTime.now();
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

    public void setMethod(String method) { this.method = method; }
    public void setStatus(PaymentStatus status) { this.status = status; }
    public void setGatewayReference(String gatewayReference) { this.gatewayReference = gatewayReference; }
}
