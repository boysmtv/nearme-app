package id.dekat.tenant.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants")
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "legal_name")
    private String legalName;

    @Column(name = "tax_id")
    private String taxId;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "verification_status", nullable = false)
    private String verificationStatus;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TenantStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    @Column(name = "version")
    private Long version;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (verificationStatus == null) {
            verificationStatus = "UNVERIFIED";
        }
        if (status == null) {
            status = TenantStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Tenant() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getLegalName() { return legalName; }
    public void setLegalName(String legalName) { this.legalName = legalName; }

    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public TenantStatus getStatus() { return status; }
    public void setStatus(TenantStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public Builder toBuilder() {
        return new Builder(this);
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final Tenant tenant;

        public Builder() {
            this.tenant = new Tenant();
        }

        public Builder(Tenant tenant) {
            this.tenant = tenant;
        }

        public Builder id(UUID id) { tenant.id = id; return this; }
        public Builder name(String name) { tenant.name = name; return this; }
        public Builder slug(String slug) { tenant.slug = slug; return this; }
        public Builder legalName(String legalName) { tenant.legalName = legalName; return this; }
        public Builder taxId(String taxId) { tenant.taxId = taxId; return this; }
        public Builder phone(String phone) { tenant.phone = phone; return this; }
        public Builder email(String email) { tenant.email = email; return this; }
        public Builder logoUrl(String logoUrl) { tenant.logoUrl = logoUrl; return this; }
        public Builder verificationStatus(String verificationStatus) { tenant.verificationStatus = verificationStatus; return this; }
        public Builder verifiedAt(LocalDateTime verifiedAt) { tenant.verifiedAt = verifiedAt; return this; }
        public Builder rejectedAt(LocalDateTime rejectedAt) { tenant.rejectedAt = rejectedAt; return this; }
        public Builder rejectionReason(String rejectionReason) { tenant.rejectionReason = rejectionReason; return this; }
        public Builder status(TenantStatus status) { tenant.status = status; return this; }
        public Builder createdAt(LocalDateTime createdAt) { tenant.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { tenant.updatedAt = updatedAt; return this; }
        public Builder version(Long version) { tenant.version = version; return this; }

        public Tenant build() { return tenant; }
    }
}
