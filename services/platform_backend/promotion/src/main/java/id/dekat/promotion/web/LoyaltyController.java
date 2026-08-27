package id.dekat.promotion.web;

import id.dekat.promotion.application.LoyaltyService;
import id.dekat.promotion.domain.LoyaltyEntry;
import id.dekat.promotion.web.dto.LoyaltyEarnRequest;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/provider/loyalty")
@RequiredArgsConstructor
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLoyaltyInfo(
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @PathVariable UUID customerId) {
        int balance = loyaltyService.getBalance(tenantId, customerId);
        List<LoyaltyEntry> history = loyaltyService.getHistory(tenantId, customerId);

        Map<String, Object> result = new HashMap<>();
        result.put("balance", balance);
        result.put("history", history);

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/earn")
    public ResponseEntity<ApiResponse<LoyaltyEntry>> earnPoints(
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @RequestBody LoyaltyEarnRequest request) {
        UUID customerId = UUID.fromString(request.customerId());
        UUID bookingId = request.bookingId() != null ? UUID.fromString(request.bookingId()) : null;

        LoyaltyEntry entry = loyaltyService.earnPoints(tenantId, customerId, bookingId, request.points());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(entry));
    }
}
