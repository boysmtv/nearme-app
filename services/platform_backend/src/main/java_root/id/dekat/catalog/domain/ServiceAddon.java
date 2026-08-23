package id.dekat.catalog.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "service_addons")
public class ServiceAddon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "service_id", nullable = false)
    private UUID serviceId;

    @Column(nullable = false)
    private String name;

    @Column(name = "price_amount", precision = 12, scale = 2)
    private BigDecimal priceAmount;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "max_quantity")
    private Integer maxQuantity;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired;

    public ServiceAddon() {}

    public ServiceAddon(UUID serviceId, String name, BigDecimal priceAmount, Integer durationMinutes, Integer maxQuantity, Boolean isRequired) {
        this.serviceId = serviceId;
        this.name = name;
        this.priceAmount = priceAmount;
        this.durationMinutes = durationMinutes;
        this.maxQuantity = maxQuantity;
        this.isRequired = isRequired;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getServiceId() { return serviceId; }
    public void setServiceId(UUID serviceId) { this.serviceId = serviceId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getPriceAmount() { return priceAmount; }
    public void setPriceAmount(BigDecimal priceAmount) { this.priceAmount = priceAmount; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Integer getMaxQuantity() { return maxQuantity; }
    public void setMaxQuantity(Integer maxQuantity) { this.maxQuantity = maxQuantity; }

    public Boolean getIsRequired() { return isRequired; }
    public void setIsRequired(Boolean isRequired) { this.isRequired = isRequired; }

    public Builder toBuilder() {
        return new Builder(this);
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final ServiceAddon addon;

        public Builder() {
            this.addon = new ServiceAddon();
        }

        public Builder(ServiceAddon addon) {
            this.addon = addon;
        }

        public Builder id(UUID id) { addon.id = id; return this; }
        public Builder serviceId(UUID serviceId) { addon.serviceId = serviceId; return this; }
        public Builder name(String name) { addon.name = name; return this; }
        public Builder priceAmount(BigDecimal priceAmount) { addon.priceAmount = priceAmount; return this; }
        public Builder durationMinutes(Integer durationMinutes) { addon.durationMinutes = durationMinutes; return this; }
        public Builder maxQuantity(Integer maxQuantity) { addon.maxQuantity = maxQuantity; return this; }
        public Builder isRequired(Boolean isRequired) { addon.isRequired = isRequired; return this; }

        public ServiceAddon build() { return addon; }
    }
}
