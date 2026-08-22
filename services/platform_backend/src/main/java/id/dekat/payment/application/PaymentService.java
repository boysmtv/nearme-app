package id.dekat.payment.application;

import id.dekat.common.NotFoundException;
import id.dekat.payment.domain.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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

    @Transactional
    public PaymentIntent createPaymentIntent(UUID bookingId, UUID tenantId,
                                             BigDecimal amount, String currency,
                                             String method) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
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
            existing.markExpired();
            paymentRepository.save(existing);
        }

        PaymentIntent intent = new PaymentIntent(
                bookingId, tenantId, amount, currency, method,
                OffsetDateTime.now().plusMinutes(PAYMENT_EXPIRY_MINUTES)
        );

        PaymentTransaction initTransaction = new PaymentTransaction(
                intent.getId(), GATEWAY_PROVIDER, amount,
                PaymentTransaction.TransactionStatus.PENDING, null
        );

        PaymentIntent saved = paymentRepository.save(intent);
        paymentTransactionRepository.save(initTransaction);

        return saved;
    }

    @Transactional
    public void processWebhook(String provider, Map<String, Object> payload) {
        String gatewayRef = (String) payload.get("gateway_reference");
        String eventType = (String) payload.get("event_type");
        String orderId = (String) payload.get("order_id");

        if (gatewayRef == null || eventType == null) {
            throw new IllegalArgumentException("Invalid webhook payload: missing gateway_reference or event_type");
        }

        PaymentIntent intent = paymentRepository.findByGatewayReference(gatewayRef)
                .orElseThrow(() -> new NotFoundException("Payment intent not found for ref: " + gatewayRef));

        // Idempotency check
        if (intent.getStatus() == PaymentStatus.PAID && "payment.success".equals(eventType)) {
            return; // Already processed
        }
        if (intent.getStatus() == PaymentStatus.FAILED && "payment.failed".equals(eventType)) {
            return; // Already processed
        }

        PaymentTransaction transaction = new PaymentTransaction(
                intent.getId(), provider, intent.getAmount(),
                PaymentTransaction.TransactionStatus.INITIATED, payload
        );

        switch (eventType) {
            case "payment.success" -> {
                intent.markPaid();
                transaction.markSucceeded(gatewayRef);
                recordLedgerEntry(intent, LedgerEntry.EntryType.PAYMENT,
                        "Payment received via " + provider);
            }
            case "payment.failed" -> {
                intent.markFailed();
                transaction.markFailed();
            }
            case "payment.expired" -> {
                intent.markExpired();
                transaction.markFailed();
            }
            case "refund.success" -> {
                recordLedgerEntry(intent, LedgerEntry.EntryType.REFUND,
                        "Refund processed via " + provider);
            }
            default -> {
                transaction.markFailed();
            }
        }

        paymentTransactionRepository.save(transaction);
        paymentRepository.save(intent);
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateRefundAmount(UUID bookingId, String cancellationPolicy,
                                            OffsetDateTime bookingStartsAt) {
        List<Refund> existingRefunds = refundRepository.findByBookingId(bookingId);
        BigDecimal totalRefunded = existingRefunds.stream()
                .filter(r -> r.getStatus() == Refund.RefundStatus.PROCESSED)
                .map(Refund::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        PaymentIntent paidIntent = paymentRepository.findByBookingIdAndStatus(
                bookingId, PaymentStatus.PAID
        ).orElseThrow(() -> new NotFoundException("No paid intent found for booking"));

        BigDecimal paidAmount = paidIntent.getAmount().subtract(totalRefunded);

        if (paidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        if (cancellationPolicy == null || "full_refund".equals(cancellationPolicy)) {
            return paidAmount;
        }

        if ("no_refund".equals(cancellationPolicy)) {
            return BigDecimal.ZERO;
        }

        if (cancellationPolicy.startsWith("tiered:")) {
            return calculateTieredRefund(paidAmount, bookingStartsAt, cancellationPolicy);
        }

        if (cancellationPolicy.startsWith("percentage:")) {
            BigDecimal pct = new BigDecimal(cancellationPolicy.substring("percentage:".length()));
            return paidAmount.multiply(pct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        return paidAmount;
    }

    @Transactional
    public Refund processRefund(UUID bookingId, BigDecimal amount, String reason, UUID approverId) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Refund amount must be positive");
        }

        PaymentIntent paidIntent = paymentRepository.findByBookingIdAndStatus(
                bookingId, PaymentStatus.PAID
        ).orElseThrow(() -> new NotFoundException("No paid intent found for booking"));

        List<Refund> existingRefunds = refundRepository.findByBookingId(bookingId);
        BigDecimal totalRefunded = existingRefunds.stream()
                .filter(r -> r.getStatus() == Refund.RefundStatus.PROCESSED
                        || r.getStatus() == Refund.RefundStatus.APPROVED)
                .map(Refund::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalRefunded.add(amount).compareTo(paidIntent.getAmount()) > 0) {
            throw new IllegalArgumentException(
                "Refund amount exceeds available. Max refund: "
                + paidIntent.getAmount().subtract(totalRefunded)
            );
        }

        Refund refund = new Refund(bookingId, paidIntent.getId(), amount, reason);
        refund.approve(approverId);

        if (totalRefunded.add(amount).compareTo(paidIntent.getAmount()) >= 0) {
            paidIntent.markRefunded();
        } else {
            paidIntent.markPartialRefund();
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
        return paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.PAID)
                .or(() -> paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.PENDING))
                .orElseThrow(() -> new NotFoundException("No payment found for booking: " + bookingId));
    }

    @Transactional(readOnly = true)
    public List<Refund> getRefundsByBookingId(UUID bookingId) {
        return refundRepository.findByBookingId(bookingId);
    }

    private BigDecimal calculateTieredRefund(BigDecimal paidAmount, OffsetDateTime bookingStartsAt,
                                              String policy) {
        if (bookingStartsAt == null) {
            return paidAmount;
        }

        long hoursUntilBooking = java.time.temporal.ChronoUnit.HOURS.between(
                OffsetDateTime.now(), bookingStartsAt
        );

        // Default tiered policy: 100% if >48h, 50% if >24h, 25% if >6h, 0% otherwise
        if (hoursUntilBooking > 48) {
            return paidAmount;
        } else if (hoursUntilBooking > 24) {
            return paidAmount.multiply(new BigDecimal("0.50")).setScale(2, RoundingMode.HALF_UP);
        } else if (hoursUntilBooking > 6) {
            return paidAmount.multiply(new BigDecimal("0.25")).setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }

    private void recordLedgerEntry(PaymentIntent intent, LedgerEntry.EntryType entryType, String description) {
        LedgerEntry entry = new LedgerEntry(
                intent.getTenantId(), intent.getBookingId(), entryType,
                intent.getAmount(), intent.getCurrency(), description
        );
        ledgerEntryRepository.save(entry);
    }
}
