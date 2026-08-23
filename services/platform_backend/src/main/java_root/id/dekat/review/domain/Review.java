package id.dekat.review.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "review")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, columnDefinition = "uuid")
    private UUID bookingId;

    @Column(nullable = false, columnDefinition = "uuid")
    private UUID customerId;

    @Column(nullable = false, columnDefinition = "uuid")
    private UUID tenantId;

    @Column(nullable = false)
    private Integer overallRating;

    private Integer timelinessRating;

    private Integer qualityRating;

    @Column(columnDefinition = "text")
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.PUBLISHED;

    @Column(columnDefinition = "text")
    private String providerResponse;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public enum ReviewStatus {
        PUBLISHED, HIDDEN, REMOVED
    }
}
