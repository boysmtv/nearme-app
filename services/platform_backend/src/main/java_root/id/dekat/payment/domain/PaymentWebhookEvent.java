package id.dekat.payment.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_webhook_events")
public class PaymentWebhookEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "gateway_provider", nullable = false)
    private String gatewayProvider;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(name = "raw_payload", nullable = false, columnDefinition = "TEXT")
    private String rawPayload;

    @Column(name = "processed_at")
    private OffsetDateTime processedAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected PaymentWebhookEvent() {}

    public PaymentWebhookEvent(String gatewayProvider, String eventId, String rawPayload) {
        this.gatewayProvider = gatewayProvider;
        this.eventId = eventId;
        this.rawPayload = rawPayload;
        this.processedAt = OffsetDateTime.now();
        this.createdAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public String getGatewayProvider() { return gatewayProvider; }
    public String getEventId() { return eventId; }
    public String getRawPayload() { return rawPayload; }
    public OffsetDateTime getProcessedAt() { return processedAt; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
