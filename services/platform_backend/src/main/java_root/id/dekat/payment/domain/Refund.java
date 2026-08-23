package id.dekat.payment.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "refunds")
public class Refund {

    public enum RefundStatus {
        PENDING, APPROVED, REJECTED, PROCESSED, FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID bookingId;

    @Column(nullable = false)
    private UUID paymentIntentId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RefundStatus status;

    private String gatewayReference;

    private UUID approvedBy;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    protected Refund() {}

    public Refund(UUID bookingId, UUID paymentIntentId, BigDecimal amount,
                  String reason) {
        this.bookingId = bookingId;
        this.paymentIntentId = paymentIntentId;
        this.amount = amount;
        this.reason = reason;
        this.status = RefundStatus.PENDING;
        this.createdAt = OffsetDateTime.now();
    }

    public void approve(UUID approverId) {
        this.status = RefundStatus.APPROVED;
        this.approvedBy = approverId;
    }

    public void reject() {
        this.status = RefundStatus.REJECTED;
    }

    public void markProcessed(String gatewayReference) {
        this.status = RefundStatus.PROCESSED;
        this.gatewayReference = gatewayReference;
    }

    public void markFailed() {
        this.status = RefundStatus.FAILED;
    }

    public UUID getId() { return id; }
    public UUID getBookingId() { return bookingId; }
    public UUID getPaymentIntentId() { return paymentIntentId; }
    public BigDecimal getAmount() { return amount; }
    public String getReason() { return reason; }
    public RefundStatus getStatus() { return status; }
    public String getGatewayReference() { return gatewayReference; }
    public UUID getApprovedBy() { return approvedBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
