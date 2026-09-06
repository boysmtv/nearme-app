package id.dekat.payment.web;

import id.dekat.payment.application.PaymentService;
import id.dekat.payment.domain.PaymentIntent;
import id.dekat.payment.infrastructure.gateway.PaymentGatewayPort;
import id.dekat.payment.web.dto.PaymentIntentRequest;
import id.dekat.payment.domain.Refund;
import id.dekat.payment.web.dto.PaymentResponse;
import id.dekat.sharedkernel.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@Tag(name = "Payment", description = "Manajemen pembayaran, refund, dan webhook gateway")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentGatewayPort gateway;
    private final ObjectMapper objectMapper;

    public PaymentController(PaymentService paymentService, PaymentGatewayPort gateway, ObjectMapper objectMapper) {
        this.paymentService = paymentService;
        this.gateway = gateway;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/bookings/{id}/payment-intents")
    @Operation(summary = "Buat payment intent", description = "Membuat pembayaran untuk booking, menghasilkan redirect URL atau VA number")
    public ResponseEntity<PaymentResponse> createPaymentIntent(
            @PathVariable UUID id,
            @RequestBody PaymentIntentRequest request) {
        PaymentIntent intent = paymentService.createPaymentIntent(
                id, request.getTenantId(), request.getAmount(),
                request.getCurrency(), request.getMethod()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(PaymentResponse.from(intent));
    }

    @GetMapping("/payments/{id}")
    @Operation(summary = "Cek status pembayaran", description = "Mendapatkan status pembayaran berdasarkan payment intent ID")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable UUID id) {
        PaymentIntent intent = paymentService.getPaymentStatus(id);
        return ResponseEntity.ok(PaymentResponse.from(intent));
    }

    @PostMapping("/webhooks/payments/{provider}")
    @Operation(summary = "Webhook dari payment gateway", description = "Endpoint callback dari Midtrans/Xendit untuk notifikasi status pembayaran")
    public ResponseEntity<Void> handleWebhook(@PathVariable String provider,
                                              @RequestHeader(value = "X-Signature", required = false) String signature,
                                              @RequestBody String rawBody) {
        if (signature != null && !gateway.verifyWebhookSignature(rawBody, signature)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = objectMapper.readValue(rawBody, Map.class);
            paymentService.processWebhook(provider, payload);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bookings/{id}/refund")
    @Operation(summary = "Proses refund", description = "Memproses pengembalian dana untuk booking")
    public ResponseEntity<ApiResponse<Refund>> processRefund(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        Integer amount = (Integer) body.get("amount");
        String reason = (String) body.getOrDefault("reason", "Refund requested");
        UUID approverId = UUID.fromString((String) body.get("approverId"));
        Refund refund = paymentService.processRefund(id, amount, reason, approverId);
        return ResponseEntity.ok(ApiResponse.ok(refund, "Refund processed"));
    }

    @GetMapping("/bookings/{id}/refunds")
    @Operation(summary = "Daftar refund", description = "Mendapatkan semua refund untuk sebuah booking")
    public ResponseEntity<ApiResponse<List<Refund>>> getRefunds(@PathVariable UUID id) {
        List<Refund> refunds = paymentService.getRefundsByBookingId(id);
        return ResponseEntity.ok(ApiResponse.ok(refunds));
    }

    @GetMapping("/bookings/{id}/refund-estimate")
    @Operation(summary = "Estimasi refund", description = "Menghitung estimasi pengembalian dana tanpa memproses")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRefundEstimate(
            @PathVariable UUID id,
            @RequestParam(required = false) String cancellationPolicy) {
        try {
            int estimate = paymentService.calculateRefundAmount(id, cancellationPolicy, null);
            return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "bookingId", id.toString(),
                "estimatedRefund", estimate,
                "cancellationPolicy", cancellationPolicy != null ? cancellationPolicy : "full_refund"
            )));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error("Booking not found or no payment: " + e.getMessage()));
        }
    }
}
