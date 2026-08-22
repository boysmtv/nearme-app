package id.dekat.catalog.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "service_categories")
public class ServiceCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "ACTIVE";
        }
    }

    public ServiceCategory() {}

    public ServiceCategory(String name, String slug, UUID parentId) {
        this.name = name;
        this.slug = slug;
        this.parentId = parentId;
        this.status = "ACTIVE";
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getParentId() { return parentId; }
    public void setParentId(UUID parentId) { this.parentId = parentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getIconUrl() { return iconUrl; }
    public void setIconUrl(String iconUrl) { this.iconUrl = iconUrl; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public Builder toBuilder() {
        return new Builder(this);
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final ServiceCategory category;

        public Builder() {
            this.category = new ServiceCategory();
        }

        public Builder(ServiceCategory category) {
            this.category = category;
        }

        public Builder id(UUID id) { category.id = id; return this; }
        public Builder parentId(UUID parentId) { category.parentId = parentId; return this; }
        public Builder name(String name) { category.name = name; return this; }
        public Builder slug(String slug) { category.slug = slug; return this; }
        public Builder iconUrl(String iconUrl) { category.iconUrl = iconUrl; return this; }
        public Builder sortOrder(Integer sortOrder) { category.sortOrder = sortOrder; return this; }
        public Builder status(String status) { category.status = status; return this; }
        public Builder createdAt(LocalDateTime createdAt) { category.createdAt = createdAt; return this; }

        public ServiceCategory build() { return category; }
    }
}
