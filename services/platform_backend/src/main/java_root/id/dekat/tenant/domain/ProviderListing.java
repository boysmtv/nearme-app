package id.dekat.tenant.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants")
@lombok.Getter
@lombok.Setter
@lombok.NoArgsConstructor
public class ProviderListing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String slug;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String logoUrl;

    @Column(length = 20)
    private String phone;

    @Column(length = 320)
    private String email;

    @Column(name = "verified_at")
    private OffsetDateTime verifiedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
