package id.dekat.payment.web;

import id.dekat.payment.domain.LedgerEntry;
import id.dekat.payment.domain.LedgerEntryRepository;
import id.dekat.payment.domain.SettlementBatch;
import id.dekat.payment.domain.SettlementBatchRepository;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/provider/settlement")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementBatchRepository settlementBatchRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.05");

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listSettlements(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestParam(defaultValue = "10") int limit) {
        if (tenantId == null) {
            return ResponseEntity.ok(ApiResponse.ok(List.of()));
        }
        List<SettlementBatch> batches = settlementBatchRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        List<Map<String, Object>> result = batches.stream().limit(limit).map(this::toMap).toList();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSettlement(@PathVariable UUID id) {
        return settlementBatchRepository.findById(id)
                .map(b -> ResponseEntity.ok(ApiResponse.ok(toMap(b))))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/request")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> requestPayout(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestBody Map<String, Object> body) {
        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        LocalDate periodEnd = LocalDate.now();
        LocalDate periodStart = periodEnd.minusWeeks(1);

        List<LedgerEntry> entries = ledgerEntryRepository.findByTenantId(tenantId);
        int totalRevenue = entries.stream()
                .filter(e -> e.getEntryType() == LedgerEntry.EntryType.REVENUE
                        && !e.getCreatedAt().isBefore(periodStart.atStartOfDay().atOffset(OffsetDateTime.now().getOffset())))
                .mapToInt(LedgerEntry::getAmount)
                .sum();

        int totalRefunds = entries.stream()
                .filter(e -> e.getEntryType() == LedgerEntry.EntryType.REFUND
                        && !e.getCreatedAt().isBefore(periodStart.atStartOfDay().atOffset(OffsetDateTime.now().getOffset())))
                .mapToInt(LedgerEntry::getAmount)
                .sum();

        int netRevenue = totalRevenue - totalRefunds;
        int commission = BigDecimal.valueOf(netRevenue).multiply(COMMISSION_RATE).setScale(0, RoundingMode.HALF_UP).intValue();
        int netPayout = netRevenue - commission;

        SettlementBatch batch = new SettlementBatch(
                tenantId, periodStart, periodEnd,
                (long) totalRevenue, (long) commission, (long) netPayout
        );

        String bankName = (String) body.getOrDefault("bankName", null);
        String bankAccount = (String) body.getOrDefault("bankAccount", null);
        String bankAccountName = (String) body.getOrDefault("bankAccountName", null);
        if (bankName != null) batch.setBankName(bankName);
        if (bankAccount != null) batch.setBankAccount(bankAccount);
        if (bankAccountName != null) batch.setBankAccountName(bankAccountName);

        SettlementBatch saved = settlementBatchRepository.save(batch);
        return ResponseEntity.ok(ApiResponse.ok(toMap(saved)));
    }

    private Map<String, Object> toMap(SettlementBatch b) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", b.getId().toString());
        map.put("tenantId", b.getTenantId().toString());
        map.put("period", b.getPeriodStart() + " to " + b.getPeriodEnd());
        map.put("totalRevenue", b.getTotalRevenue());
        map.put("commission", b.getCommission());
        map.put("netPayout", b.getNetPayout());
        map.put("status", b.getStatus().toString());
        map.put("paidAt", b.getPaidAt() != null ? b.getPaidAt().toString() : null);
        map.put("bankName", b.getBankName());
        map.put("bankAccount", b.getBankAccount());
        map.put("bankAccountName", b.getBankAccountName());
        map.put("createdAt", b.getCreatedAt().toString());
        map.put("currency", "IDR");
        return map;
    }
}
