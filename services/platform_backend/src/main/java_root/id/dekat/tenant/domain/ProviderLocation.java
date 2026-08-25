package id.dekat.tenant.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "locations")
@lombok.Getter
@lombok.Setter
@lombok.NoArgsConstructor
public class ProviderLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "business_id")
    private UUID businessId;

    @Column(nullable = false)
    private String name;

    @Column(name = "address_line1")
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    private String city;

    private String province;

    @Column(name = "postal_code", length = 10)
    private String postalCode;

    @Column(length = 2, nullable = false)
    private String country = "ID";

    private BigDecimal latitude;

    private BigDecimal longitude;

    @Column(length = 20)
    private String phone;

    @Column(length = 50, nullable = false)
    private String timezone = "Asia/Jakarta";

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
