package id.dekat.platformconfig.web;

import id.dekat.platformconfig.application.FeatureFlagService;
import id.dekat.platformconfig.domain.FeatureFlag;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/feature-flags")
@RequiredArgsConstructor
public class FeatureFlagController {

    private final FeatureFlagService featureFlagService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FeatureFlag>>> listFlags() {
        return ResponseEntity.ok(ApiResponse.ok(featureFlagService.getAllFlags()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FeatureFlag>> getFlag(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(featureFlagService.getFlag(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FeatureFlag>> createFlag(@RequestBody FeatureFlag flag) {
        return ResponseEntity.ok(ApiResponse.ok(featureFlagService.createFlag(flag), "Feature flag created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FeatureFlag>> updateFlag(@PathVariable UUID id, @RequestBody FeatureFlag flag) {
        return ResponseEntity.ok(ApiResponse.ok(featureFlagService.updateFlag(id, flag), "Feature flag updated"));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<FeatureFlag>> toggleFlag(@PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
        boolean enabled = body.getOrDefault("enabled", true);
        return ResponseEntity.ok(ApiResponse.ok(featureFlagService.toggleFlag(id, enabled), "Feature flag toggled"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFlag(@PathVariable UUID id) {
        featureFlagService.deleteFlag(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Feature flag deleted"));
    }
}
