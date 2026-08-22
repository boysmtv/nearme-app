package id.dekat.sharedkernel.outbox;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "outbox_events", indexes = {
    @Index(name = "idx_outbox_aggregate", columnList = "aggregateType, aggregateId"),
    @Index(name = "idx_outbox_status", columnList = "status, createdAt")
})
@Getter
@Setter
public class OutboxEvent {

    @Id
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
    @Enumerated(EnumType.STRING)
    private OutboxStatus status = OutboxStatus.PENDING;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant processedAt;

    private int retryCount = 0;

    private static final int MAX_RETRIES = 5;

    @PrePersist
    void prePersist() {
        this.id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }

    public boolean canRetry() {
        return retryCount < MAX_RETRIES;
    }

    public void incrementRetry() {
        this.retryCount++;
    }
}
