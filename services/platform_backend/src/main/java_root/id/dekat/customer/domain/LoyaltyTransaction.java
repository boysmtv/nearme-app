package id.dekat.customer.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "loyalty_transactions")
@lombok.Getter
@lombok.Setter
@lombok.NoArgsConstructor
public class LoyaltyTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "type", nullable = false, length = 20)
    private String type; // EARN, REDEEM, BONUS, EXPIRE

    @Column(name = "points", nullable = false)
    private Integer points;

    @Column(name = "booking_id")
    private UUID bookingId;

    @Column(name = "description", length = 200)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
