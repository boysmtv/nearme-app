package id.dekat.tenant.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "businesses")
@lombok.Getter
@lombok.Setter
@lombok.NoArgsConstructor
public class BusinessProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String industry;

    @Column(name = "website_url", columnDefinition = "TEXT")
    private String websiteUrl;

    @Column(length = 320)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "banner_url", columnDefinition = "TEXT")
    private String bannerUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BusinessStatus status = BusinessStatus.ACTIVE;

    public enum BusinessStatus {
        ACTIVE, SUSPENDED, DEACTIVATED
    }

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
