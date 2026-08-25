package id.dekat.notification.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_deliveries")
@lombok.Getter
@lombok.Setter
@lombok.NoArgsConstructor
public class DeliveryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "recipient_id", nullable = false)
    private UUID recipientId;

    @Column(name = "template_id", nullable = false)
    private UUID templateId;

    @Column(nullable = false, length = 16)
    private String channel;

    @Column(length = 512)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false, length = 32)
    private String status = "PENDING";

    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "delivered_at")
    private OffsetDateTime deliveredAt;
}
