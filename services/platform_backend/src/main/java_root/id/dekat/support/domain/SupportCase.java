package id.dekat.support.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "support_cases")
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

    @Column(name = "tenant_id", nullable = false, columnDefinition = "uuid")
    private UUID tenantId;

    @Column(name = "customer_id", nullable = false, columnDefinition = "uuid")
    private UUID customerId;

    @Column(name = "subject", nullable = false, length = 512)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private CaseStatus status = CaseStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 16)
    @Builder.Default
    private CasePriority priority = CasePriority.MEDIUM;

    @Column(name = "assigned_to", columnDefinition = "uuid")
    private UUID assignedTo;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum CasePriority {
        LOW, MEDIUM, HIGH, URGENT
    }

    public enum CaseStatus {
        OPEN, IN_PROGRESS, WAITING, RESOLVED, CLOSED
    }
}
