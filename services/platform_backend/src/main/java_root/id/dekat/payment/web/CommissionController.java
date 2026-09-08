package id.dekat.payment.web;

import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/provider/commission")
public class CommissionController {

    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.05"); // 5%

    @GetMapping("/statement")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatement(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestParam(defaultValue = "30") int days) {
        // In production: calculate from ledger_entries table
        Map<String, Object> statement = new LinkedHashMap<>();
        statement.put("tenantId", tenantId.toString());
        statement.put("period", days + " days");
        statement.put("commissionRate", "5%");
        statement.put("totalRevenue", 5000000);
        statement.put("totalCommission", 250000);
        statement.put("netPayout", 4750000);
        statement.put("currency", "IDR");

        List<Map<String, Object>> breakdown = new ArrayList<>();
        breakdown.add(Map.of("date", OffsetDateTime.now().minusDays(7).toString(), "revenue", 1200000, "commission", 60000));
        breakdown.add(Map.of("date", OffsetDateTime.now().minusDays(6).toString(), "revenue", 980000, "commission", 49000));
        breakdown.add(Map.of("date", OffsetDateTime.now().minusDays(5).toString(), "revenue", 1500000, "commission", 75000));
        statement.put("breakdown", breakdown);

        return ResponseEntity.ok(ApiResponse.ok(statement));
    }

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCommissionConfig(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "rate", "5%",
                "rateDecimal", COMMISSION_RATE,
                "minBookingAmount", 10000,
                "currency", "IDR"
        )));
    }
}
