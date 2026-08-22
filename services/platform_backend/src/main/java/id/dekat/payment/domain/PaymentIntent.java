package id.dekat.payment.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_intents")
public class PaymentIntent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID bookingId;

    @Column(nullable = false)
    private UUID tenantId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    private String method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    private String gatewayReference;

    private OffsetDateTime expiresAt;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private OffsetDateTime updatedAt;

    protected PaymentIntent() {}

    public PaymentIntent(UUID bookingId, UUID tenantId, BigDecimal amount,
                         String currency, String method, OffsetDateTime expiresAt) {
        this.bookingId = bookingId;
        this.tenantId = tenantId;
        this.amount = amount;
        this.currency = currency;
        this.method = method;
        this.status = PaymentStatus.CREATED;
        this.expiresAt = expiresAt;
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    public void markPending(String gatewayReference) {
        this.status = PaymentStatus.PENDING;
        this.gatewayReference = gatewayReference;
        this.updatedAt = OffsetDateTime.now();
    }

    public void markPaid() {
        this.status = PaymentStatus.PAID;
        this.updatedAt = OffsetDateTime.now();
    }

    public void markFailed() {
        this.status = PaymentStatus.FAILED;
        this.updatedAt = OffsetDateTime.now();
    }

    public void markExpired() {
        this.status = PaymentStatus.EXPIRED;
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

    public void markPartialRefund() {
        this.status = PaymentStatus.PARTIAL_REFUND;
        this.updatedAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getBookingId() { return bookingId; }
    public UUID getTenantId() { return tenantId; }
    public BigDecimal getAmount() { return amount; }
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
