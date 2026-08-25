package id.dekat.staff.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "staff")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Staff {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    @Column(name = "tenant_id", nullable = false, columnDefinition = "uuid")
    private UUID tenantId;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "title", length = 100)
    private String title;

    @Column(columnDefinition = "text")
    private String bio;

    @Column(name = "avatar_url", columnDefinition = "text")
    private String avatarUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(nullable = false)
    private Integer version;
}
