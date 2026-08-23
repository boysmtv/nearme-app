package id.dekat.catalog.web.dto;

import id.dekat.catalog.domain.PriceType;
import id.dekat.catalog.domain.ServiceAddon;
import id.dekat.catalog.domain.ServiceVariant;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ServiceResponse {

    private UUID id;
    private UUID tenantId;
    private UUID categoryId;
    private String name;
    private String slug;
    private String description;
    private Integer durationMinutes;
    private PriceType priceType;
    private BigDecimal basePriceAmount;
    private String currency;
    private BigDecimal depositAmount;
    private BigDecimal taxRate;
    private Integer bufferBeforeMinutes;
    private Integer bufferAfterMinutes;
    private String visibility;
    private String status;
    private List<ServiceVariant> variants;
    private List<ServiceAddon> addons;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ServiceResponse() {}

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

    public List<ServiceVariant> getVariants() { return variants; }
    public void setVariants(List<ServiceVariant> variants) { this.variants = variants; }

    public List<ServiceAddon> getAddons() { return addons; }
    public void setAddons(List<ServiceAddon> addons) { this.addons = addons; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
