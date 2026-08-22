package id.dekat.support.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "support_case")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportCase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, columnDefinition = "uuid")
    private UUID tenantId;

    @Column(columnDefinition = "uuid")
    private UUID bookingId;

    @Column(nullable = false, columnDefinition = "uuid")
    private UUID reporterId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseType caseType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CaseSeverity severity = CaseSeverity.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CaseStatus status = CaseStatus.OPEN;

    @Column(columnDefinition = "uuid")
    private UUID ownerId;

    private Instant slaDeadline;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant resolvedAt;

    public enum CaseType {
        BOOKING_ISSUE, PAYMENT_DISPUTE, SERVICE_QUALITY, CANCELLATION_REQUEST, OTHER
    }

    public enum CaseSeverity {
        LOW, MEDIUM, HIGH, URGENT
    }

    public enum CaseStatus {
        OPEN, IN_PROGRESS, ESCALATED, RESOLVED, CLOSED
    }
}
