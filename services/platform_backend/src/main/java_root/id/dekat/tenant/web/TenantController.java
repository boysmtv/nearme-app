package id.dekat.tenant.web;

import id.dekat.tenant.application.TenantService;
import id.dekat.tenant.domain.Location;
import id.dekat.tenant.domain.Tenant;
import id.dekat.tenant.web.dto.CreateTenantRequest;
import id.dekat.tenant.web.dto.LocationRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/provider")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @PostMapping("/tenant")
    public ResponseEntity<Tenant> createTenant(@Valid @RequestBody CreateTenantRequest request) {
        Tenant tenant = tenantService.createTenant(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(tenant);
    }

    @GetMapping("/tenant")
    public ResponseEntity<List<Tenant>> getAllTenants() {
        List<Tenant> tenants = tenantService.getAllTenants();
        return ResponseEntity.ok(tenants);
    }

    @GetMapping("/tenant/{id}")
    public ResponseEntity<Tenant> getTenantById(@PathVariable UUID id) {
        Tenant tenant = tenantService.getTenantById(id);
        return ResponseEntity.ok(tenant);
    }

    @GetMapping("/tenant/slug/{slug}")
    public ResponseEntity<Tenant> getTenantBySlug(@PathVariable String slug) {
        Tenant tenant = tenantService.getTenantBySlug(slug);
        return ResponseEntity.ok(tenant);
    }

    @PutMapping("/tenant/{id}")
    public ResponseEntity<Tenant> updateTenant(@PathVariable UUID id, @Valid @RequestBody CreateTenantRequest request) {
        Tenant tenant = tenantService.updateTenant(id, request);
        return ResponseEntity.ok(tenant);
    }

    @PostMapping("/tenant/{id}/submit")
    public ResponseEntity<Tenant> submitForReview(@PathVariable UUID id) {
        Tenant tenant = tenantService.submitForReview(id);
        return ResponseEntity.ok(tenant);
    }

    @PostMapping("/tenant/{id}/approve")
    public ResponseEntity<Tenant> approveTenant(@PathVariable UUID id) {
        Tenant tenant = tenantService.approveTenant(id);
        return ResponseEntity.ok(tenant);
    }

    @PostMapping("/tenant/{id}/reject")
    public ResponseEntity<Tenant> rejectTenant(@PathVariable UUID id) {
        Tenant tenant = tenantService.rejectTenant(id);
        return ResponseEntity.ok(tenant);
    }

    @PostMapping("/tenant/{id}/suspend")
    public ResponseEntity<Tenant> suspendTenant(@PathVariable UUID id) {
        Tenant tenant = tenantService.suspendTenant(id);
        return ResponseEntity.ok(tenant);
    }

    @PostMapping("/tenant/{id}/reactivate")
    public ResponseEntity<Tenant> reactivateTenant(@PathVariable UUID id) {
        Tenant tenant = tenantService.reactivateTenant(id);
        return ResponseEntity.ok(tenant);
    }

    @PostMapping("/tenant/{tenantId}/locations")
    public ResponseEntity<Location> createLocation(@PathVariable UUID tenantId, @Valid @RequestBody LocationRequest request) {
        Location location = tenantService.createLocation(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(location);
    }

    @GetMapping("/tenant/{tenantId}/locations")
    public ResponseEntity<List<Location>> getLocations(@PathVariable UUID tenantId) {
        List<Location> locations = tenantService.getLocationsByTenantId(tenantId);
        return ResponseEntity.ok(locations);
    }

    @PutMapping("/locations/{id}")
    public ResponseEntity<Location> updateLocation(@PathVariable UUID id, @Valid @RequestBody LocationRequest request) {
        Location location = tenantService.updateLocation(id, request);
        return ResponseEntity.ok(location);
    }
}
