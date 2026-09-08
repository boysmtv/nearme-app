package id.dekat.payment.web;

import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/provider/settlement")
public class SettlementController {

    // In-memory store (production would use settlement_batches table)
    private static final List<Map<String, Object>> settlements = new ArrayList<>();

    static {
        // Seed sample settlements
        settlements.add(Map.of(
                "id", UUID.randomUUID().toString(),
                "period", "2026-09-01 to 2026-09-07",
                "totalRevenue", 3500000,
                "commission", 175000,
                "netPayout", 3325000,
                "status", "PAID",
                "paidAt", OffsetDateTime.now().minusDays(1).toString(),
                "currency", "IDR"
        ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listSettlements(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(settlements.stream().limit(limit).toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSettlement(@PathVariable UUID id) {
        return settlements.stream()
                .filter(s -> id.toString().equals(s.get("id")))
                .findFirst()
                .map(s -> ResponseEntity.ok(ApiResponse.ok(s)))
                .orElseThrow(() -> new RuntimeException("Settlement not found"));
    }

    @PostMapping("/request")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> requestPayout(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> settlement = new LinkedHashMap<>();
        settlement.put("id", UUID.randomUUID().toString());
        settlement.put("tenantId", tenantId.toString());
        settlement.put("amount", body.get("amount"));
        settlement.put("status", "PENDING");
        settlement.put("requestedAt", OffsetDateTime.now().toString());
        settlement.put("currency", "IDR");

        settlements.add(settlement);
        return ResponseEntity.ok(ApiResponse.ok(settlement));
    }
}
