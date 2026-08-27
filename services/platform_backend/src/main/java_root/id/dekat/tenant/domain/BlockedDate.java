package id.dekat.tenant.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "blocked_dates")
public class BlockedDate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "blocked_date", nullable = false)
    private LocalDate blockedDate;

    @Column(name = "reason")
    private String reason;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public BlockedDate() {}
    public BlockedDate(UUID tenantId, LocalDate blockedDate, String reason) {
        this.tenantId = tenantId;
        this.blockedDate = blockedDate;
        this.reason = reason;
        this.createdAt = OffsetDateTime.now();
    }
    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public LocalDate getBlockedDate() { return blockedDate; }
    public String getReason() { return reason; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
