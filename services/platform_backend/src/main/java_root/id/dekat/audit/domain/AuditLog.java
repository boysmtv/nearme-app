package id.dekat.audit.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "actor_id", columnDefinition = "uuid")
    private UUID actorId;

    @Column(name = "action", nullable = false, length = 128)
    private String action;

    @Column(name = "resource_type", nullable = false, length = 64)
    private String resourceType;

    @Column(name = "resource_id", columnDefinition = "uuid")
    private UUID resourceId;

    @Column(name = "before_snapshot", columnDefinition = "jsonb")
    private String beforeSnapshot;

    @Column(name = "after_snapshot", columnDefinition = "jsonb")
    private String afterSnapshot;

    @Column(name = "reason", columnDefinition = "text")
    private String reason;

    @Column(name = "request_id", nullable = false, length = 128)
    private String requestId;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "text")
    private String userAgent;

    @Enumerated(EnumType.STRING)
    @Column(name = "result", nullable = false, length = 16)
    @Builder.Default
    private AuditResult result = AuditResult.OK;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public enum AuditResult {
        OK, DENIED, ERROR
    }
}
