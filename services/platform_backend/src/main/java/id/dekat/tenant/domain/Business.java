package id.dekat.tenant.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "businesses")
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "legal_name", nullable = false)
    private String legalName;

    @Column(name = "tax_id")
    private String taxId;

    @Column(name = "registration_doc_url")
    private String registrationDocUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Business() {}

    public Business(UUID tenantId, String legalName, String taxId, String registrationDocUrl) {
        this.tenantId = tenantId;
        this.legalName = legalName;
        this.taxId = taxId;
        this.registrationDocUrl = registrationDocUrl;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }

    public String getLegalName() { return legalName; }
    public void setLegalName(String legalName) { this.legalName = legalName; }

    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }

    public String getRegistrationDocUrl() { return registrationDocUrl; }
    public void setRegistrationDocUrl(String registrationDocUrl) { this.registrationDocUrl = registrationDocUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public Builder toBuilder() {
        return new Builder(this);
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final Business business;

        public Builder() {
            this.business = new Business();
        }

        public Builder(Business business) {
            this.business = business;
        }

        public Builder id(UUID id) { business.id = id; return this; }
        public Builder tenantId(UUID tenantId) { business.tenantId = tenantId; return this; }
        public Builder legalName(String legalName) { business.legalName = legalName; return this; }
        public Builder taxId(String taxId) { business.taxId = taxId; return this; }
        public Builder registrationDocUrl(String registrationDocUrl) { business.registrationDocUrl = registrationDocUrl; return this; }
        public Builder createdAt(LocalDateTime createdAt) { business.createdAt = createdAt; return this; }

        public Business build() { return business; }
    }
}
