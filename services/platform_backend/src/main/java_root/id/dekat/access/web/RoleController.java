package id.dekat.access.web;

import id.dekat.access.application.AuthorizationService;
import id.dekat.access.domain.Permission;
import id.dekat.access.domain.Role;
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

    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = authorizationService.getUserRoles(null, null);
        return ResponseEntity.ok(roles);
    }

    @PostMapping
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        return ResponseEntity.status(HttpStatus.CREATED).body(role);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Role> getRoleById(@PathVariable UUID id) {
        return ResponseEntity.ok(new Role());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Role> updateRole(@PathVariable UUID id, @RequestBody Role role) {
        role.setId(id);
        return ResponseEntity.ok(role);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable UUID id) {
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/permissions")
    public ResponseEntity<List<Permission>> addPermissions(
            @PathVariable UUID id,
            @RequestBody List<Permission> permissions) {
        List<Permission> result = authorizationService.getRolePermissions(id);
        return ResponseEntity.ok(result);
    }
}
