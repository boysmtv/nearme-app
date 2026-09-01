package id.dekat.reporting.web;

import id.dekat.reporting.application.ReportingService;
import id.dekat.sharedkernel.web.ApiResponse;
import id.dekat.tenant.domain.ProviderListing;
import id.dekat.tenant.domain.ProviderListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/provider/reports")
@RequiredArgsConstructor
public class ReportingController {

    private final ReportingService reportingService;
    private final ProviderListingRepository providerListingRepository;

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantIdHeader,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false, defaultValue = "day") String granularity) {
        UUID tenantId = resolveTenant(tenantIdHeader);
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            Map<String, Object> data = reportingService.getAnalytics(tenantId, start, end, granularity);
            return ResponseEntity.ok(ApiResponse.ok(data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("startDate/endDate must be yyyy-MM-dd: " + e.getMessage()));
        }
    }

    @GetMapping("/export")
    public ResponseEntity<?> export(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantIdHeader,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false, defaultValue = "csv") String format) {
        UUID tenantId = resolveTenant(tenantIdHeader);
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            if ("csv".equalsIgnoreCase(format)) {
                String csv = reportingService.exportCsv(tenantId, start, end);
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"dekat-analytics-" + start + "-" + end + ".csv\"")
                        .contentType(MediaType.parseMediaType("text/csv"))
                        .body(csv);
            }
            // json fallback
            Map<String, Object> data = reportingService.getAnalytics(tenantId, start, end, "day");
            return ResponseEntity.ok(ApiResponse.ok(data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("export failed: " + e.getMessage()));
        }
    }

    private UUID resolveTenant(UUID header) {
        if (header != null) return header;
        return providerListingRepository.findAll().stream().findFirst().map(ProviderListing::getId)
                .orElseThrow(() -> new IllegalStateException("No tenant available"));
    }
}
