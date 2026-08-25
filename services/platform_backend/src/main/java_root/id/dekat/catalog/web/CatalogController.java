package id.dekat.catalog.web;

import id.dekat.catalog.application.CatalogService;
import id.dekat.catalog.domain.ServiceItem;
import id.dekat.catalog.web.dto.ServiceRequest;
import id.dekat.catalog.web.dto.ServiceResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @PostMapping("/provider/{tenantId}/services")
    public ResponseEntity<ServiceItem> createService(
            @PathVariable UUID tenantId,
            @Valid @RequestBody ServiceRequest request) {
        ServiceItem service = catalogService.createService(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(service);
    }

    @GetMapping("/provider/{tenantId}/services")
    public ResponseEntity<List<ServiceResponse>> getServicesByTenant(@PathVariable UUID tenantId) {
        List<ServiceResponse> services = catalogService.getServicesByTenant(tenantId, null, null);
        return ResponseEntity.ok(services);
    }

    @PostMapping("/provider/services/{id}/publish")
    public ResponseEntity<ServiceItem> publishService(@PathVariable UUID id) {
        ServiceItem service = catalogService.publishService(id);
        return ResponseEntity.ok(service);
    }

    @PostMapping("/provider/services/{id}/unpublish")
    public ResponseEntity<ServiceItem> unpublishService(@PathVariable UUID id) {
        ServiceItem service = catalogService.unpublishService(id);
        return ResponseEntity.ok(service);
    }

    @GetMapping("/services/{id}")
    public ResponseEntity<ServiceResponse> getServicePublic(@PathVariable UUID id) {
        ServiceResponse service = catalogService.getServiceWithPricing(id);
        return ResponseEntity.ok(service);
    }
}
