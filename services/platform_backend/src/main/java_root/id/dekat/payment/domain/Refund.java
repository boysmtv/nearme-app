package id.dekat.payment.domain;

import jakarta.persistence.*;
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
    @Column(name = "id")
    private UUID id;

    @Column(name = "booking_id", nullable = false)
    private UUID bookingId;

    @Column(name = "payment_intent_id", nullable = false)
    private UUID paymentIntentId;

    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Column(name = "reason")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RefundStatus status;

    @Column(name = "gateway_reference")
    private String gatewayReference;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected Refund() {}

    public Refund(UUID bookingId, UUID paymentIntentId, Integer amount,
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
    public Integer getAmount() { return amount; }
    public String getReason() { return reason; }
    public RefundStatus getStatus() { return status; }
    public String getGatewayReference() { return gatewayReference; }
    public UUID getApprovedBy() { return approvedBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
