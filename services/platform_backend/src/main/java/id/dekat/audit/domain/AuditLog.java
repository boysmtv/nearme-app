package id.dekat.audit.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
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

    @Column(nullable = false, columnDefinition = "uuid")
    private UUID actorId;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String resourceType;

    @Column(nullable = false, columnDefinition = "uuid")
    private UUID resourceId;

    @Column(columnDefinition = "jsonb")
    private String beforeSnapshot;

    @Column(columnDefinition = "jsonb")
    private String afterSnapshot;

    @Column(columnDefinition = "text")
    private String reason;

    @Column(nullable = false)
    private String requestId;

    private String ipAddress;

    private String userAgent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AuditResult result = AuditResult.SUCCESS;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public enum AuditResult {
        SUCCESS, FAILURE, PARTIAL
    }
}
