package id.dekat.payment.application;

import id.dekat.common.NotFoundException;
import id.dekat.payment.domain.*;
import id.dekat.payment.infrastructure.gateway.PaymentGatewayPort;
import id.dekat.payment.infrastructure.gateway.CreateTransactionRequest;
import id.dekat.payment.infrastructure.gateway.PaymentResult;
import id.dekat.payment.infrastructure.gateway.RefundRequest;
import id.dekat.payment.infrastructure.gateway.RefundResult;
import id.dekat.payment.infrastructure.gateway.WebhookEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final int PAYMENT_EXPIRY_MINUTES = 30;
    private static final String GATEWAY_PROVIDER = "midtrans";

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final PaymentGatewayPort gateway;
    private final PaymentWebhookEventRepository webhookEventRepository;

    @Transactional
    public PaymentIntent createPaymentIntent(UUID bookingId, UUID tenantId,
                                             Integer amount, String currency,
                                             String method) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }
        if (currency == null || currency.isBlank()) {
            throw new IllegalArgumentException("Currency is required");
        }

        PaymentIntent existing = paymentRepository.findByBookingIdAndStatus(
                bookingId, PaymentStatus.PENDING
        ).orElse(null);
        if (existing != null && existing.getExpiresAt().isAfter(OffsetDateTime.now())) {
            return existing;
        }

        if (existing != null) {
            existing.markCancelled();
            paymentRepository.save(existing);
        }

        PaymentIntent intent = new PaymentIntent(
                bookingId, tenantId, amount, currency, method,
                OffsetDateTime.now().plusMinutes(PAYMENT_EXPIRY_MINUTES)
        );

        PaymentIntent saved = paymentRepository.save(intent);

        CreateTransactionRequest gatewayRequest = CreateTransactionRequest.builder()
                .orderId(saved.getId().toString())
                .amount(saved.getAmount())
                .currency(saved.getCurrency())
                .callbackUrl("/webhooks/payments/" + GATEWAY_PROVIDER)
                .expiry(saved.getExpiresAt())
                .build();

        PaymentResult gatewayResult = gateway.createTransaction(gatewayRequest);

        if (gatewayResult.isSuccess()) {
            saved.markAuthorized(gatewayResult.getReferenceId());
        } else {
            saved.markFailed();
        }

        PaymentTransaction initTransaction = new PaymentTransaction(
                saved.getId(), GATEWAY_PROVIDER, amount,
                PaymentTransaction.TransactionStatus.INITIATED, null
        );

        paymentTransactionRepository.save(initTransaction);
        paymentRepository.save(saved);

        return saved;
    }

    @Transactional
    public void processWebhook(String provider, Map<String, Object> payload) {
        String rawPayload = payload.toString();
        String eventId = (String) payload.getOrDefault("event_id", UUID.randomUUID().toString());

        WebhookEvent webhookEvent = WebhookEvent.builder()
                .eventType((String) payload.get("event_type"))
                .orderId((String) payload.get("order_id"))
                .referenceId((String) payload.get("gateway_reference"))
                .status((String) payload.get("status"))
                .build();

        String gatewayRef = webhookEvent.getReferenceId();
        String eventType = webhookEvent.getEventType();

        if (gatewayRef == null || eventType == null) {
            throw new IllegalArgumentException("Invalid webhook payload: missing gateway_reference or event_type");
        }

        PaymentWebhookEvent existingEvent = webhookEventRepository
                .findByGatewayProviderAndEventId(provider, eventId).orElse(null);
        if (existingEvent != null) {
            return;
        }

        PaymentIntent intent = paymentRepository.findByGatewayReference(gatewayRef)
                .orElseThrow(() -> new NotFoundException("Payment intent not found for ref: " + gatewayRef));

        if (intent.getStatus() == PaymentStatus.CAPTURED && "payment.success".equals(eventType)) {
            return;
        }
        if (intent.getStatus() == PaymentStatus.FAILED && "payment.failed".equals(eventType)) {
            return;
        }

        PaymentTransaction transaction = new PaymentTransaction(
                intent.getId(), provider, intent.getAmount(),
                PaymentTransaction.TransactionStatus.INITIATED, payload
        );

        switch (eventType) {
            case "payment.success" -> {
                intent.markCaptured();
                transaction.markSuccess(gatewayRef);
                recordLedgerEntry(intent, LedgerEntry.EntryType.REVENUE,
                        "Payment received via " + provider);
            }
            case "payment.failed" -> {
                intent.markFailed();
                transaction.markFailed();
            }
            case "refund.success" -> {
                intent.markRefunded();
                transaction.markSuccess(gatewayRef);
                recordLedgerEntry(intent, LedgerEntry.EntryType.REFUND,
                        "Refund processed via " + provider);
            }
            default -> {
                transaction.markFailed();
            }
        }

        PaymentWebhookEvent webhookRecord = new PaymentWebhookEvent(provider, eventId, rawPayload);
        webhookEventRepository.save(webhookRecord);

        paymentTransactionRepository.save(transaction);
        paymentRepository.save(intent);
    }

    @Transactional(readOnly = true)
    public Integer calculateRefundAmount(UUID bookingId, String cancellationPolicy,
                                         OffsetDateTime bookingStartsAt) {
        List<Refund> existingRefunds = refundRepository.findByBookingId(bookingId);
        int totalRefunded = existingRefunds.stream()
                .filter(r -> r.getStatus() == Refund.RefundStatus.PROCESSED)
                .mapToInt(Refund::getAmount)
                .sum();

        PaymentIntent paidIntent = paymentRepository.findByBookingIdAndStatus(
                bookingId, PaymentStatus.CAPTURED
        ).orElseThrow(() -> new NotFoundException("No paid intent found for booking"));

        int paidAmount = paidIntent.getAmount() - totalRefunded;

        if (paidAmount <= 0) {
            return 0;
        }

        if (cancellationPolicy == null || "full_refund".equals(cancellationPolicy)) {
            return paidAmount;
        }

        if ("no_refund".equals(cancellationPolicy)) {
            return 0;
        }

        if (cancellationPolicy.startsWith("tiered:")) {
            return calculateTieredRefund(paidAmount, bookingStartsAt, cancellationPolicy);
        }

        if (cancellationPolicy.startsWith("percentage:")) {
            int pct = Integer.parseInt(cancellationPolicy.substring("percentage:".length()));
            return (paidAmount * pct) / 100;
        }

        return paidAmount;
    }

    @Transactional
    public Refund processRefund(UUID bookingId, Integer amount, String reason, UUID approverId) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Refund amount must be positive");
        }

        PaymentIntent paidIntent = paymentRepository.findByBookingIdAndStatus(
                bookingId, PaymentStatus.CAPTURED
        ).orElseThrow(() -> new NotFoundException("No paid intent found for booking"));

        List<Refund> existingRefunds = refundRepository.findByBookingId(bookingId);
        int totalRefunded = existingRefunds.stream()
                .filter(r -> r.getStatus() == Refund.RefundStatus.PROCESSED
                        || r.getStatus() == Refund.RefundStatus.APPROVED)
                .mapToInt(Refund::getAmount)
                .sum();

        if (totalRefunded + amount > paidIntent.getAmount()) {
            throw new IllegalArgumentException(
                "Refund amount exceeds available. Max refund: "
                + (paidIntent.getAmount() - totalRefunded)
            );
        }

        Refund refund = new Refund(bookingId, paidIntent.getId(), amount, reason);
        refund.approve(approverId);

        RefundRequest gatewayRequest = RefundRequest.builder()
                .referenceId(paidIntent.getGatewayReference())
                .amount(amount)
                .reason(reason)
                .build();

        RefundResult gatewayResult = gateway.processRefund(gatewayRequest);

        if (gatewayResult.isSuccess()) {
            refund.markProcessed(gatewayResult.getRefundId());
        } else {
            refund.markFailed();
        }

        if (totalRefunded + amount >= paidIntent.getAmount()) {
            paidIntent.markRefunded();
        }

        paymentRepository.save(paidIntent);
        Refund saved = refundRepository.save(refund);

        LedgerEntry entry = new LedgerEntry(
                paidIntent.getTenantId(), bookingId, LedgerEntry.EntryType.REFUND,
                amount, paidIntent.getCurrency(), "Refund: " + reason
        );
        ledgerEntryRepository.save(entry);

        return saved;
    }

    @Transactional(readOnly = true)
    public PaymentIntent getPaymentStatus(UUID paymentIntentId) {
        return paymentRepository.findById(paymentIntentId)
                .orElseThrow(() -> new NotFoundException("Payment intent not found: " + paymentIntentId));
    }

    @Transactional(readOnly = true)
    public PaymentIntent getPaymentByBookingId(UUID bookingId) {
        return paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.CAPTURED)
                .or(() -> paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.PENDING))
                .orElseThrow(() -> new NotFoundException("No payment found for booking: " + bookingId));
    }

    @Transactional(readOnly = true)
    public List<Refund> getRefundsByBookingId(UUID bookingId) {
        return refundRepository.findByBookingId(bookingId);
    }

    private int calculateTieredRefund(int paidAmount, OffsetDateTime bookingStartsAt,
                                      String policy) {
        if (bookingStartsAt == null) {
            return paidAmount;
        }

        long hoursUntilBooking = java.time.temporal.ChronoUnit.HOURS.between(
                OffsetDateTime.now(), bookingStartsAt
        );

        if (hoursUntilBooking > 48) {
            return paidAmount;
        } else if (hoursUntilBooking > 24) {
            return (paidAmount * 50) / 100;
        } else if (hoursUntilBooking > 6) {
            return (paidAmount * 25) / 100;
        }
        return 0;
    }

    private void recordLedgerEntry(PaymentIntent intent, LedgerEntry.EntryType entryType, String description) {
        LedgerEntry entry = new LedgerEntry(
                intent.getTenantId(), intent.getBookingId(), entryType,
                intent.getAmount(), intent.getCurrency(), description
        );
        ledgerEntryRepository.save(entry);
    }
}
