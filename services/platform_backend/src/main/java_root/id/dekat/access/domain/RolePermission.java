package id.dekat.access.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "role_permissions")
public class RolePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID roleId;

    @Column(nullable = false)
    private UUID permissionId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public RolePermission() {}

    public RolePermission(UUID roleId, UUID permissionId) {
        this.roleId = roleId;
        this.permissionId = permissionId;
    }

    public UUID getId() { return id; }
    public UUID getRoleId() { return roleId; }
    public UUID getPermissionId() { return permissionId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
