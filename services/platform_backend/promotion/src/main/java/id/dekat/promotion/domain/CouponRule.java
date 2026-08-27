package id.dekat.promotion.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "coupon_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponRule {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "coupon_id", nullable = false, columnDefinition = "uuid")
    private UUID couponId;

    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", nullable = false)
    private CouponRuleType ruleType;

    @Column(name = "rule_value", nullable = false, columnDefinition = "jsonb")
    private String ruleValue;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
