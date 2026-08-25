package id.dekat.tenant.domain;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import org.hibernate.annotations.Type;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "locations")
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column(name = "timezone", length = 50)
    private String timezone;

    private String phone;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> serviceModes;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> operatingHours;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Location() {}

    public Location(UUID tenantId, String name, String address, Double latitude, Double longitude) {
        this.tenantId = tenantId;
        this.name = name;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = "ACTIVE";
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public List<String> getServiceModes() { return serviceModes; }
    public void setServiceModes(List<String> serviceModes) { this.serviceModes = serviceModes; }

    public Map<String, Object> getOperatingHours() { return operatingHours; }
    public void setOperatingHours(Map<String, Object> operatingHours) { this.operatingHours = operatingHours; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public Builder toBuilder() {
        return new Builder(this);
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final Location location;

        public Builder() {
            this.location = new Location();
        }

        public Builder(Location location) {
            this.location = location;
        }

        public Builder id(UUID id) { location.id = id; return this; }
        public Builder tenantId(UUID tenantId) { location.tenantId = tenantId; return this; }
        public Builder name(String name) { location.name = name; return this; }
        public Builder address(String address) { location.address = address; return this; }
        public Builder latitude(Double latitude) { location.latitude = latitude; return this; }
        public Builder longitude(Double longitude) { location.longitude = longitude; return this; }
        public Builder timezone(String timezone) { location.timezone = timezone; return this; }
        public Builder phone(String phone) { location.phone = phone; return this; }
        public Builder serviceModes(List<String> serviceModes) { location.serviceModes = serviceModes; return this; }
        public Builder operatingHours(Map<String, Object> operatingHours) { location.operatingHours = operatingHours; return this; }
        public Builder status(String status) { location.status = status; return this; }
        public Builder createdAt(LocalDateTime createdAt) { location.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { location.updatedAt = updatedAt; return this; }

        public Location build() { return location; }
    }
}
