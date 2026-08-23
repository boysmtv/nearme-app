package id.dekat.payment.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {

    public enum TransactionStatus {
        INITIATED, SUCCEEDED, FAILED, PENDING
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID paymentIntentId;

    @Column(nullable = false)
    private String gatewayProvider;

    private String gatewayReference;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    @Column(columnDefinition = "jsonb")
    @Convert(converter = id.dekat.common.JsonbMapConverter.class)
    private Map<String, Object> rawResponse;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    protected PaymentTransaction() {}

    public PaymentTransaction(UUID paymentIntentId, String gatewayProvider,
                              BigDecimal amount, TransactionStatus status,
                              Map<String, Object> rawResponse) {
        this.paymentIntentId = paymentIntentId;
        this.gatewayProvider = gatewayProvider;
        this.amount = amount;
        this.status = status;
        this.rawResponse = rawResponse;
        this.createdAt = OffsetDateTime.now();
    }

    public void markSucceeded(String gatewayReference) {
        this.status = TransactionStatus.SUCCEEDED;
        this.gatewayReference = gatewayReference;
    }

    public void markFailed() {
        this.status = TransactionStatus.FAILED;
    }

    public UUID getId() { return id; }
    public UUID getPaymentIntentId() { return paymentIntentId; }
    public String getGatewayProvider() { return gatewayProvider; }
    public String getGatewayReference() { return gatewayReference; }
    public BigDecimal getAmount() { return amount; }
    public TransactionStatus getStatus() { return status; }
    public Map<String, Object> getRawResponse() { return rawResponse; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
