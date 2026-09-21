package id.dekat.payment.web;

import id.dekat.payment.domain.LedgerEntry;
import id.dekat.payment.domain.LedgerEntryRepository;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/provider/commission")
@RequiredArgsConstructor
public class CommissionController {

    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.05"); // 5%

    private final LedgerEntryRepository ledgerEntryRepository;

    @GetMapping("/statement")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatement(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestParam(defaultValue = "30") int days) {
        if (tenantId == null) {
            return ResponseEntity.ok(ApiResponse.ok(Map.of(
                    "tenantId", "null",
                    "period", days + " days",
                    "commissionRate", "5%",
                    "totalRevenue", 0,
                    "totalCommission", 0,
                    "netPayout", 0,
                    "currency", "IDR",
                    "breakdown", List.of()
            )));
        }

        List<LedgerEntry> entries = ledgerEntryRepository.findByTenantId(tenantId);
        OffsetDateTime since = OffsetDateTime.now().minusDays(days);

        List<LedgerEntry> recentEntries = entries.stream()
                .filter(e -> e.getCreatedAt().isAfter(since))
                .toList();

        int totalRevenue = recentEntries.stream()
                .filter(e -> e.getEntryType() == LedgerEntry.EntryType.REVENUE)
                .mapToInt(LedgerEntry::getAmount)
                .sum();

        int totalRefunds = recentEntries.stream()
                .filter(e -> e.getEntryType() == LedgerEntry.EntryType.REFUND)
                .mapToInt(LedgerEntry::getAmount)
                .sum();

        int netRevenue = totalRevenue - totalRefunds;
        int totalCommission = BigDecimal.valueOf(netRevenue)
                .multiply(COMMISSION_RATE)
                .setScale(0, RoundingMode.HALF_UP)
                .intValue();
        int netPayout = netRevenue - totalCommission;

        Map<String, Object> statement = new LinkedHashMap<>();
        statement.put("tenantId", tenantId.toString());
        statement.put("period", days + " days");
        statement.put("commissionRate", "5%");
        statement.put("totalRevenue", totalRevenue);
        statement.put("totalCommission", totalCommission);
        statement.put("netPayout", netPayout);
        statement.put("currency", "IDR");

        Map<String, Integer> dailyBreakdown = recentEntries.stream()
                .filter(e -> e.getEntryType() == LedgerEntry.EntryType.REVENUE)
                .collect(Collectors.toMap(
                        e -> e.getCreatedAt().toLocalDate().toString(),
                        LedgerEntry::getAmount,
                        Integer::sum
                ));

        List<Map<String, Object>> breakdown = dailyBreakdown.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByKey().reversed())
                .limit(30)
                .map(e -> {
                    int rev = e.getValue();
                    int comm = BigDecimal.valueOf(rev).multiply(COMMISSION_RATE).setScale(0, RoundingMode.HALF_UP).intValue();
                    return (Map<String, Object>) Map.<String, Object>of("date", e.getKey(), "revenue", rev, "commission", comm);
                })
                .toList();
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
