package id.dekat.review.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "review_photos", uniqueConstraints = @UniqueConstraint(columnNames = {"review_id", "media_asset_id"}),
        indexes = {
                @Index(name = "idx_review_photos_review", columnList = "review_id"),
                @Index(name = "idx_review_photos_media", columnList = "media_asset_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "review_id", nullable = false, columnDefinition = "uuid")
    private UUID reviewId;

    @Column(name = "media_asset_id", nullable = false, columnDefinition = "uuid")
    private UUID mediaAssetId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
