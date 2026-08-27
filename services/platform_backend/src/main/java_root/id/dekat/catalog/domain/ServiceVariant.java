package id.dekat.catalog.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "service_variants")
public class ServiceVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "service_id", nullable = false)
    private UUID serviceId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "price_amount", precision = 12, scale = 2)
    private BigDecimal priceAmount;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    public ServiceVariant() {}

    public ServiceVariant(UUID serviceId, String name, BigDecimal priceAmount, Integer durationMinutes) {
        this.serviceId = serviceId;
        this.name = name;
        this.priceAmount = priceAmount;
        this.durationMinutes = durationMinutes;
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

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Builder toBuilder() {
        return new Builder(this);
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final ServiceVariant variant;

        public Builder() {
            this.variant = new ServiceVariant();
        }

        public Builder(ServiceVariant variant) {
            this.variant = variant;
        }

        public Builder id(UUID id) { variant.id = id; return this; }
        public Builder serviceId(UUID serviceId) { variant.serviceId = serviceId; return this; }
        public Builder name(String name) { variant.name = name; return this; }
        public Builder priceAmount(BigDecimal priceAmount) { variant.priceAmount = priceAmount; return this; }
        public Builder durationMinutes(Integer durationMinutes) { variant.durationMinutes = durationMinutes; return this; }
        public Builder description(String description) { variant.description = description; return this; }

        public ServiceVariant build() { return variant; }
    }
}
