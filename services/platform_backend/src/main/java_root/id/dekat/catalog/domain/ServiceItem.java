package id.dekat.catalog.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "service_items")
public class ServiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "slug", nullable = false)
    private String slug;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "price_type", nullable = false)
    private PriceType priceType;

    @Column(name = "base_price_amount", precision = 12, scale = 2)
    private BigDecimal basePriceAmount;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "deposit_amount", precision = 12, scale = 2)
    private BigDecimal depositAmount;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate;

    @Column(name = "buffer_before_minutes")
    private Integer bufferBeforeMinutes;

    @Column(name = "buffer_after_minutes")
    private Integer bufferAfterMinutes;

    @Column(name = "visibility", nullable = false)
    private String visibility;

    @Column(name = "status", nullable = false)
    private String status;

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
            status = "DRAFT";
        }
        if (visibility == null) {
            visibility = "PRIVATE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public ServiceItem() {}

    public ServiceItem(UUID tenantId, UUID categoryId, String name, String slug, Integer durationMinutes, PriceType priceType) {
        this.tenantId = tenantId;
        this.categoryId = categoryId;
        this.name = name;
        this.slug = slug;
        this.durationMinutes = durationMinutes;
        this.priceType = priceType;
        this.status = "DRAFT";
        this.visibility = "PRIVATE";
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }

    public UUID getCategoryId() { return categoryId; }
    public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public PriceType getPriceType() { return priceType; }
    public void setPriceType(PriceType priceType) { this.priceType = priceType; }

    public BigDecimal getBasePriceAmount() { return basePriceAmount; }
    public void setBasePriceAmount(BigDecimal basePriceAmount) { this.basePriceAmount = basePriceAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getDepositAmount() { return depositAmount; }
    public void setDepositAmount(BigDecimal depositAmount) { this.depositAmount = depositAmount; }

    public BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }

    public Integer getBufferBeforeMinutes() { return bufferBeforeMinutes; }
    public void setBufferBeforeMinutes(Integer bufferBeforeMinutes) { this.bufferBeforeMinutes = bufferBeforeMinutes; }

    public Integer getBufferAfterMinutes() { return bufferAfterMinutes; }
    public void setBufferAfterMinutes(Integer bufferAfterMinutes) { this.bufferAfterMinutes = bufferAfterMinutes; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

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
        private final ServiceItem serviceItem;

        public Builder() {
            this.serviceItem = new ServiceItem();
        }

        public Builder(ServiceItem serviceItem) {
            this.serviceItem = serviceItem;
        }

        public Builder id(UUID id) { serviceItem.id = id; return this; }
        public Builder tenantId(UUID tenantId) { serviceItem.tenantId = tenantId; return this; }
        public Builder categoryId(UUID categoryId) { serviceItem.categoryId = categoryId; return this; }
        public Builder name(String name) { serviceItem.name = name; return this; }
        public Builder slug(String slug) { serviceItem.slug = slug; return this; }
        public Builder description(String description) { serviceItem.description = description; return this; }
        public Builder durationMinutes(Integer durationMinutes) { serviceItem.durationMinutes = durationMinutes; return this; }
        public Builder priceType(PriceType priceType) { serviceItem.priceType = priceType; return this; }
        public Builder basePriceAmount(BigDecimal basePriceAmount) { serviceItem.basePriceAmount = basePriceAmount; return this; }
        public Builder currency(String currency) { serviceItem.currency = currency; return this; }
        public Builder depositAmount(BigDecimal depositAmount) { serviceItem.depositAmount = depositAmount; return this; }
        public Builder taxRate(BigDecimal taxRate) { serviceItem.taxRate = taxRate; return this; }
        public Builder bufferBeforeMinutes(Integer bufferBeforeMinutes) { serviceItem.bufferBeforeMinutes = bufferBeforeMinutes; return this; }
        public Builder bufferAfterMinutes(Integer bufferAfterMinutes) { serviceItem.bufferAfterMinutes = bufferAfterMinutes; return this; }
        public Builder visibility(String visibility) { serviceItem.visibility = visibility; return this; }
        public Builder status(String status) { serviceItem.status = status; return this; }
        public Builder createdAt(LocalDateTime createdAt) { serviceItem.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { serviceItem.updatedAt = updatedAt; return this; }
        public Builder version(Long version) { serviceItem.version = version; return this; }

        public ServiceItem build() { return serviceItem; }
    }
}
