package id.dekat.customer.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "customer_favorites", uniqueConstraints = @UniqueConstraint(columnNames = {"customer_id", "staff_id"}),
        indexes = {
                @Index(name = "idx_customer_favorites_customer", columnList = "customer_id"),
                @Index(name = "idx_customer_favorites_staff", columnList = "staff_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "customer_id", nullable = false, columnDefinition = "uuid")
    private UUID customerId;

    @Column(name = "staff_id", nullable = false, columnDefinition = "uuid")
    private UUID staffId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
