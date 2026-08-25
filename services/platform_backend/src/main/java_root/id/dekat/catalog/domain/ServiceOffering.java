package id.dekat.catalog.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "services")
@lombok.Getter
@lombok.Setter
@lombok.NoArgsConstructor
public class ServiceOffering {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "short_description", length = 500)
    private String shortDescription;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 30;

    @Column(name = "buffer_minutes", nullable = false)
    private Integer bufferMinutes = 0;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;

    @Column(nullable = false, length = 3)
    private String currency = "IDR";

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "requires_resource", nullable = false)
    private Boolean requiresResource = false;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Version
    @Column(nullable = false)
    private Integer version = 1;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
