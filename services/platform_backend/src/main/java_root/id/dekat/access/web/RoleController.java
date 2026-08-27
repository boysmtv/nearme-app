package id.dekat.access.web;

import id.dekat.access.application.AuthorizationService;
import id.dekat.access.domain.Permission;
import id.dekat.access.domain.Role;
import id.dekat.access.domain.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
public class RoleController {

    private final AuthorizationService authorizationService;
    private final RoleRepository roleRepository;

    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        return ResponseEntity.ok(roles);
    }

    @PostMapping
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        Role saved = roleRepository.save(role);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Role> getRoleById(@PathVariable UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + id));
        return ResponseEntity.ok(role);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Role> updateRole(@PathVariable UUID id, @RequestBody Role role) {
        Role existing = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + id));
        if (role.getName() != null) existing.setName(role.getName());
        if (role.getDescription() != null) existing.setDescription(role.getDescription());
        if (role.getIsSystem() != null) existing.setIsSystem(role.getIsSystem());
        Role saved = roleRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + id));
        roleRepository.delete(role);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/permissions")
    public ResponseEntity<List<Permission>> addPermissions(
            @PathVariable UUID id,
            @RequestBody List<Permission> permissions) {
        List<UUID> permissionIds = permissions.stream()
                .map(Permission::getId)
                .toList();
        authorizationService.assignPermissionsToRole(id, permissionIds);
        List<Permission> result = authorizationService.getRolePermissions(id);
        return ResponseEntity.ok(result);
    }
}
