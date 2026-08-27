package id.dekat.access.application;

import id.dekat.access.domain.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthorizationService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RoleAssignmentRepository roleAssignmentRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Transactional(readOnly = true)
    public boolean hasPermission(UUID userId, String module, String action, UUID tenantId) {
        List<RoleAssignment> assignments;

        if (tenantId != null) {
            assignments = roleAssignmentRepository.findActiveAssignments(userId, tenantId, LocalDateTime.now());
        } else {
            assignments = roleAssignmentRepository.findActiveAssignmentsGlobal(userId, LocalDateTime.now());
        }

        for (RoleAssignment assignment : assignments) {
            if (assignment.getExpiresAt() != null && assignment.getExpiresAt().isBefore(LocalDateTime.now())) {
                continue;
            }

            Role role = roleRepository.findById(assignment.getRoleId()).orElse(null);
            if (role == null) continue;

            List<UUID> permissionIds = rolePermissionRepository.findPermissionIdsByRoleId(role.getId());
            List<Permission> permissions = permissionRepository.findAllById(permissionIds);

            boolean hasPerm = permissions.stream()
                    .anyMatch(p -> p.getModule().equals(module) && p.getAction().equals(action));
            if (hasPerm) {
                return true;
            }
        }
        return false;
    }

    @Transactional
    public RoleAssignment assignRole(UUID userId, UUID roleId, UUID tenantId, UUID locationId, UUID assignedBy) {
        roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId));

        if (roleAssignmentRepository.existsByUserIdAndRoleIdAndTenantId(userId, roleId, tenantId)) {
            throw new IllegalArgumentException("User already has this role in this tenant");
        }

        RoleAssignment assignment = RoleAssignment.builder()
                .userId(userId)
                .roleId(roleId)
                .tenantId(tenantId)
                .grantedBy(assignedBy)
                .build();

        return roleAssignmentRepository.save(assignment);
    }

    @Transactional
    public void removeRole(UUID userId, UUID roleId, UUID tenantId) {
        if (!roleAssignmentRepository.existsByUserIdAndRoleIdAndTenantId(userId, roleId, tenantId)) {
            throw new IllegalArgumentException("Role assignment not found");
        }
        roleAssignmentRepository.deleteByUserIdAndRoleIdAndTenantId(userId, roleId, tenantId);
    }

    @Transactional(readOnly = true)
    public List<Role> getUserRoles(UUID userId, UUID tenantId) {
        List<RoleAssignment> assignments;
        if (tenantId != null) {
            assignments = roleAssignmentRepository.findActiveAssignments(userId, tenantId, LocalDateTime.now());
        } else {
            assignments = roleAssignmentRepository.findActiveAssignmentsGlobal(userId, LocalDateTime.now());
        }

        Set<UUID> roleIds = assignments.stream()
                .map(RoleAssignment::getRoleId)
                .collect(Collectors.toSet());

        return roleRepository.findAllById(roleIds);
    }

    @Transactional(readOnly = true)
    public List<Permission> getRolePermissions(UUID roleId) {
        roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId));

        List<UUID> permissionIds = rolePermissionRepository.findPermissionIdsByRoleId(roleId);
        return permissionRepository.findAllById(permissionIds);
    }

    @Transactional(readOnly = true)
    public boolean checkTenantAccess(UUID userId, UUID tenantId) {
        List<RoleAssignment> assignments = roleAssignmentRepository.findActiveAssignments(
                userId, tenantId, LocalDateTime.now());
        return !assignments.isEmpty();
    }

    @Transactional
    public void assignPermissionsToRole(UUID roleId, List<UUID> permissionIds) {
        roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId));

        List<RolePermission> existing = rolePermissionRepository.findByRoleId(roleId);
        Set<UUID> existingPermIds = existing.stream()
                .map(RolePermission::getPermissionId)
                .collect(Collectors.toSet());

        List<RolePermission> newAssignments = permissionIds.stream()
                .filter(pid -> !existingPermIds.contains(pid))
                .map(pid -> new RolePermission(roleId, pid))
                .collect(Collectors.toList());

        rolePermissionRepository.saveAll(newAssignments);
    }
}
