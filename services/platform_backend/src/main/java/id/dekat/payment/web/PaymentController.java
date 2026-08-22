package id.dekat.payment.web;

import id.dekat.payment.application.PaymentService;
import id.dekat.payment.domain.PaymentIntent;
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

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
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
                                              @RequestBody WebhookEvent event) {
        paymentService.processWebhook(provider, event.getPayload());
        return ResponseEntity.ok().build();
    }
}
