package id.dekat.customer.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "loyalty_accounts")
@lombok.Getter
@lombok.Setter
@lombok.NoArgsConstructor
public class LoyaltyAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "customer_id", nullable = false, unique = true)
    private UUID customerId;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "points", nullable = false)
    private Integer points = 0;

    @Column(name = "total_earned", nullable = false)
    private Integer totalEarned = 0;

    @Column(name = "total_redeemed", nullable = false)
    private Integer totalRedeemed = 0;

    @Column(name = "tier", nullable = false, length = 20)
    private String tier = "BRONZE"; // BRONZE, SILVER, GOLD, PLATINUM

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    public void addPoints(int earned) {
        this.points += earned;
        this.totalEarned += earned;
        updateTier();
    }

    public boolean redeemPoints(int amount) {
        if (this.points >= amount) {
            this.points -= amount;
            this.totalRedeemed += amount;
            return true;
        }
        return false;
    }

    private void updateTier() {
        if (totalEarned >= 10000) tier = "PLATINUM";
        else if (totalEarned >= 5000) tier = "GOLD";
        else if (totalEarned >= 2000) tier = "SILVER";
        else tier = "BRONZE";
    }
}
