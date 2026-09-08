package id.dekat.catalog.web;

import id.dekat.catalog.domain.ServiceOffering;
import id.dekat.catalog.domain.ServiceOfferingRepository;
import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/provider/services")
public class ServiceBulkImportController {

    private final ServiceOfferingRepository serviceOfferingRepository;

    public ServiceBulkImportController(ServiceOfferingRepository serviceOfferingRepository) {
        this.serviceOfferingRepository = serviceOfferingRepository;
    }

    @PostMapping("/bulk")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> bulkImport(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestBody Map<String, Object> body) {
        List<Map<String, Object>> services = (List<Map<String, Object>>) body.get("services");
        if (services == null) services = new ArrayList<>();

        int imported = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();

        for (Map<String, Object> svc : services) {
            try {
                String name = (String) svc.get("name");
                if (name == null || name.isBlank()) {
                    skipped++;
                    continue;
                }

                ServiceOffering service = new ServiceOffering();
                service.setTenantId(tenantId);
                service.setName(name);
                service.setDescription((String) svc.get("description"));
                Object price = svc.get("price");
                if (price instanceof Number) {
                    service.setPrice(java.math.BigDecimal.valueOf(((Number) price).doubleValue()));
                } else if (price instanceof String) {
                    try {
                        service.setPrice(new java.math.BigDecimal((String) price));
                    } catch (Exception e) {
                        service.setPrice(java.math.BigDecimal.ZERO);
                    }
                }
                Object duration = svc.get("durationMinutes");
                if (duration instanceof Number) {
                    service.setDurationMinutes(((Number) duration).intValue());
                }
                service.setIsActive(true);
                service.setCreatedAt(OffsetDateTime.now());
                serviceOfferingRepository.save(service);
                imported++;
            } catch (Exception e) {
                skipped++;
                errors.add(e.getMessage());
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("imported", imported);
        result.put("skipped", skipped);
        result.put("errors", errors);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
