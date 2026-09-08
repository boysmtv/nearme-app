package id.dekat.tenant.web;

import id.dekat.sharedkernel.web.ApiResponse;
import id.dekat.tenant.domain.ProviderLocation;
import id.dekat.tenant.domain.ProviderLocationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/provider/locations")
public class ProviderLocationController {

    private final ProviderLocationRepository repository;

    public ProviderLocationController(ProviderLocationRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> list(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId) {
        List<ProviderLocation> locations = repository.findByTenantIdAndIsActiveTrue(tenantId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < locations.size(); i++) {
            ProviderLocation loc = locations.get(i);
            Map<String, Object> map = toMap(loc);
            map.put("isMain", i == 0);
            result.add(map);
        }
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestBody Map<String, Object> body) {
        ProviderLocation loc = new ProviderLocation();
        loc.setTenantId(tenantId);
        loc.setName((String) body.getOrDefault("name", "Utama"));
        loc.setAddressLine1((String) body.get("address"));
        loc.setPhone((String) body.get("phone"));
        loc.setLatitude(toBigDecimal(body.get("latitude")));
        loc.setLongitude(toBigDecimal(body.get("longitude")));
        loc.setIsActive(true);
        loc.setCreatedAt(OffsetDateTime.now());
        repository.save(loc);
        return ResponseEntity.ok(ApiResponse.ok(toMap(loc)));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        ProviderLocation loc = repository.findById(id).orElseThrow(() -> new RuntimeException("Location not found"));
        if (body.containsKey("name")) loc.setName((String) body.get("name"));
        if (body.containsKey("address")) loc.setAddressLine1((String) body.get("address"));
        if (body.containsKey("phone")) loc.setPhone((String) body.get("phone"));
        if (body.containsKey("latitude")) loc.setLatitude(toBigDecimal(body.get("latitude")));
        if (body.containsKey("longitude")) loc.setLongitude(toBigDecimal(body.get("longitude")));
        loc.setUpdatedAt(OffsetDateTime.now());
        repository.save(loc);
        return ResponseEntity.ok(ApiResponse.ok(toMap(loc)));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        ProviderLocation loc = repository.findById(id).orElseThrow(() -> new RuntimeException("Location not found"));
        loc.setIsActive(false);
        loc.setUpdatedAt(OffsetDateTime.now());
        repository.save(loc);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    private Map<String, Object> toMap(ProviderLocation loc) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", loc.getId().toString());
        map.put("name", loc.getName());
        map.put("address", loc.getAddressLine1());
        map.put("phone", loc.getPhone());
        map.put("latitude", loc.getLatitude());
        map.put("longitude", loc.getLongitude());
        map.put("isActive", loc.getIsActive());
        return map;
    }

    private BigDecimal toBigDecimal(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return BigDecimal.valueOf(((Number) val).doubleValue());
        return new BigDecimal(val.toString());
    }
}
