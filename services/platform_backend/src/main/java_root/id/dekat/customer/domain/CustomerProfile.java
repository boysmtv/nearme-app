package id.dekat.customer.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "customer_profiles")
@lombok.Getter
@lombok.Setter
@lombok.NoArgsConstructor
public class CustomerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(length = 100)
    private String nickname;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "loyalty_points", nullable = false)
    private Integer loyaltyPoints = 0;

    @Column(name = "total_bookings", nullable = false)
    private Integer totalBookings = 0;

    @Column(name = "total_spent", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalSpent = BigDecimal.ZERO;

    @Column(name = "last_booking_at")
    private OffsetDateTime lastBookingAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Version
    @Column(nullable = false)
    private Integer version = 1;
}
