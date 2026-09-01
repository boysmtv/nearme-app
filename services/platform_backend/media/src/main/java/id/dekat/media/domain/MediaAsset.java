package id.dekat.media.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "media_assets", indexes = {
        @Index(name = "idx_media_assets_tenant", columnList = "tenant_id"),
        @Index(name = "idx_media_assets_owner", columnList = "owner_type,owner_id"),
        @Index(name = "idx_media_assets_sort", columnList = "tenant_id,owner_type,owner_id,sort_order")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "tenant_id", nullable = false, columnDefinition = "uuid")
    private UUID tenantId;

    @Column(name = "owner_type", nullable = false, length = 20)
    private String ownerType; // provider | staff | review

    @Column(name = "owner_id", nullable = false, columnDefinition = "uuid")
    private UUID ownerId;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "storage_path", nullable = false, columnDefinition = "text")
    private String storagePath;

    @Column(name = "url", nullable = false, columnDefinition = "text")
    private String url;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Integer version = 1;
}
