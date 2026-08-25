package id.dekat.review.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "reviews")
@lombok.Getter
@lombok.Setter
@lombok.NoArgsConstructor
public class PublicReview {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "booking_id", nullable = false)
    private UUID bookingId;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewStatus status = ReviewStatus.PUBLISHED;

    public enum ReviewStatus {
        PUBLISHED, HIDDEN, PENDING
    }

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
