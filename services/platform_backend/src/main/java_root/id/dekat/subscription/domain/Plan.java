package id.dekat.subscription.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Plan {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "slug", nullable = false, unique = true, length = 128)
    private String slug;

    @Column(name = "price_amount", nullable = false)
    private Integer priceAmount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false, length = 16)
    private BillingCycle billingCycle;

    @Column(name = "max_staff", nullable = false)
    private Integer maxStaff;

    @Column(name = "max_bookings_per_month", nullable = false)
    private Integer maxBookingsPerMonth;

    @Column(name = "features", columnDefinition = "jsonb")
    private String features;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    @Builder.Default
    private PlanStatus status = PlanStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public enum BillingCycle {
        WEEKLY, MONTHLY, QUARTERLY, YEARLY
    }

    public enum PlanStatus {
        ACTIVE, INACTIVE, ARCHIVED
    }
}
