package id.dekat.payment.web;

import id.dekat.payment.application.PaymentService;
import id.dekat.payment.domain.PaymentIntent;
import id.dekat.payment.infrastructure.gateway.PaymentGatewayPort;
import id.dekat.payment.web.dto.PaymentIntentRequest;
import id.dekat.payment.web.dto.PaymentResponse;
import id.dekat.payment.web.dto.WebhookEvent;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentGatewayPort gateway;

    public PaymentController(PaymentService paymentService, PaymentGatewayPort gateway) {
        this.paymentService = paymentService;
        this.gateway = gateway;
    }

    @PostMapping("/bookings/{id}/payment-intents")
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
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable UUID id) {
        PaymentIntent intent = paymentService.getPaymentStatus(id);
        return ResponseEntity.ok(PaymentResponse.from(intent));
    }

    @PostMapping("/webhooks/payments/{provider}")
    public ResponseEntity<Void> handleWebhook(@PathVariable String provider,
                                              @RequestHeader(value = "X-Signature", required = false) String signature,
                                              @RequestBody WebhookEvent event) {
        if (signature != null && !gateway.verifyWebhookSignature(event.getPayload().toString(), signature)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        paymentService.processWebhook(provider, event.getPayload());
        return ResponseEntity.ok().build();
    }
}
