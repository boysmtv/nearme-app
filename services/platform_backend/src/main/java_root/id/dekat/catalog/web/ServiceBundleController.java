package id.dekat.catalog.web;

import id.dekat.catalog.domain.ServiceOffering;
import id.dekat.catalog.domain.ServiceOfferingRepository;
import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/provider/bundles")
public class ServiceBundleController {

    private final ServiceOfferingRepository serviceOfferingRepository;

    public ServiceBundleController(ServiceOfferingRepository serviceOfferingRepository) {
        this.serviceOfferingRepository = serviceOfferingRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> list(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId) {
        List<ServiceOffering> services = serviceOfferingRepository.findByTenantIdOrderByNameAsc(tenantId);
        List<Map<String, Object>> bundles = new ArrayList<>();
        for (ServiceOffering s : services) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", s.getId().toString());
            map.put("name", s.getName());
            map.put("description", s.getDescription());
            map.put("price", s.getPrice() != null ? s.getPrice().longValue() : 0);
            map.put("durationMinutes", s.getDurationMinutes());
            map.put("isActive", s.getIsActive());
            map.put("createdAt", s.getCreatedAt() != null ? s.getCreatedAt().toString() : null);
            bundles.add(map);
        }
        return ResponseEntity.ok(ApiResponse.ok(bundles));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestBody Map<String, Object> body) {
        ServiceOffering service = new ServiceOffering();
        service.setTenantId(tenantId);
        service.setName((String) body.getOrDefault("name", "Paket"));
        service.setDescription((String) body.get("description"));
        service.setPrice(toBigDecimal(body.get("price")));
        service.setDurationMinutes(toInt(body.get("durationMinutes")));
        service.setIsActive(true);
        service.setCreatedAt(OffsetDateTime.now());
        serviceOfferingRepository.save(service);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", service.getId().toString());
        result.put("name", service.getName());
        result.put("price", service.getPrice() != null ? service.getPrice().longValue() : 0);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        ServiceOffering service = serviceOfferingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bundle not found"));
        if (body.containsKey("name")) service.setName((String) body.get("name"));
        if (body.containsKey("description")) service.setDescription((String) body.get("description"));
        if (body.containsKey("price")) service.setPrice(toBigDecimal(body.get("price")));
        if (body.containsKey("durationMinutes")) service.setDurationMinutes(toInt(body.get("durationMinutes")));
        service.setUpdatedAt(OffsetDateTime.now());
        serviceOfferingRepository.save(service);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", service.getId().toString());
        result.put("name", service.getName());
        result.put("price", service.getPrice() != null ? service.getPrice().longValue() : 0);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        ServiceOffering service = serviceOfferingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bundle not found"));
        service.setIsActive(false);
        service.setUpdatedAt(OffsetDateTime.now());
        serviceOfferingRepository.save(service);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    private BigDecimal toBigDecimal(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return BigDecimal.valueOf(((Number) val).doubleValue());
        try { return new BigDecimal(val.toString()); } catch (Exception e) { return null; }
    }

    private int toInt(Object val) {
        if (val == null) return 0;
        if (val instanceof Number) return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return 0; }
    }
}
