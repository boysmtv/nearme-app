package id.dekat.tenant.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants")
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String category;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = VerificationStatus.DRAFT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Tenant() {}

    public Tenant(String name, String slug, String category, String contactEmail, String contactPhone) {
        this.name = name;
        this.slug = slug;
        this.category = category;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.status = VerificationStatus.DRAFT;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public VerificationStatus getStatus() { return status; }
    public void setStatus(VerificationStatus status) { this.status = status; }

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
        public Builder category(String category) { tenant.category = category; return this; }
        public Builder contactEmail(String contactEmail) { tenant.contactEmail = contactEmail; return this; }
        public Builder contactPhone(String contactPhone) { tenant.contactPhone = contactPhone; return this; }
        public Builder status(VerificationStatus status) { tenant.status = status; return this; }
        public Builder createdAt(LocalDateTime createdAt) { tenant.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { tenant.updatedAt = updatedAt; return this; }
        public Builder version(Long version) { tenant.version = version; return this; }

        public Tenant build() { return tenant; }
    }
}
