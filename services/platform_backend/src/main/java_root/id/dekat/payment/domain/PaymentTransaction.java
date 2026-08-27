package id.dekat.payment.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {

    public enum TransactionStatus {
        INITIATED, SUCCESS, FAILED, PENDING
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "payment_intent_id", nullable = false)
    private UUID paymentIntentId;

    @Column(name = "gateway_provider", nullable = false)
    private String gatewayProvider;

    @Column(name = "gateway_reference")
    private String gatewayReference;

    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TransactionStatus status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_response", columnDefinition = "jsonb")
    private Map<String, Object> rawResponse;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected PaymentTransaction() {}

    public PaymentTransaction(UUID paymentIntentId, String gatewayProvider,
                              Integer amount, TransactionStatus status,
                              Map<String, Object> rawResponse) {
        this.paymentIntentId = paymentIntentId;
        this.gatewayProvider = gatewayProvider;
        this.amount = amount;
        this.status = status;
        this.rawResponse = rawResponse;
        this.createdAt = OffsetDateTime.now();
    }

    public void markSuccess(String gatewayReference) {
        this.status = TransactionStatus.SUCCESS;
        this.gatewayReference = gatewayReference;
    }

    public void markFailed() {
        this.status = TransactionStatus.FAILED;
    }

    public UUID getId() { return id; }
    public UUID getPaymentIntentId() { return paymentIntentId; }
    public String getGatewayProvider() { return gatewayProvider; }
    public String getGatewayReference() { return gatewayReference; }
    public Integer getAmount() { return amount; }
    public TransactionStatus getStatus() { return status; }
    public Map<String, Object> getRawResponse() { return rawResponse; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
