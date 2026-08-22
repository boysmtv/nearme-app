package id.dekat.sharedkernel.outbox;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "outbox_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutboxEvent {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private String aggregateType;

    @Column(nullable = false)
    private String aggregateId;

    @Column(nullable = false)
    private String eventType;

    @Column(nullable = false, columnDefinition = "jsonb")
    private String payload;

    @Column(nullable = false)
    @Builder.Default
    private OutboxStatus status = OutboxStatus.PENDING;

    @Column(nullable = false)
    @Builder.Default
    private int retryCount = 0;

    private int maxRetries;

    private Instant nextRetryAt;

    @Column(nullable = false)
    @Builder.Default
    private String topic = "events.v1";

    private String errorMessage;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    public enum OutboxStatus {
        PENDING, PUBLISHING, PUBLISHED, FAILED, DEAD_LETTER
    }

    public void markPublishing() {
        this.status = OutboxStatus.PUBLISHING;
    }

    public void markPublished() {
        this.status = OutboxStatus.PUBLISHED;
    }

    public void markFailed(String errorMessage, int maxRetries) {
        this.retryCount++;
        this.errorMessage = errorMessage;
        this.maxRetries = maxRetries;

        if (this.retryCount >= maxRetries) {
            this.status = OutboxStatus.DEAD_LETTER;
        } else {
            this.status = OutboxStatus.FAILED;
            this.nextRetryAt = Instant.now().plusSeconds(calculateBackoffSeconds());
        }
    }

    private long calculateBackoffSeconds() {
        return Math.min(60L * (1L << retryCount), 3600L);
    }

    public boolean isRetryable() {
        return status == OutboxStatus.FAILED && retryCount < maxRetries;
    }

    public boolean isReadyForRetry() {
        return isRetryable() && (nextRetryAt == null || Instant.now().isAfter(nextRetryAt));
    }
}
