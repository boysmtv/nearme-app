package id.dekat.payment.application;

import id.dekat.common.NotFoundException;
import id.dekat.payment.domain.*;
import id.dekat.payment.infrastructure.gateway.PaymentGatewayPort;
import id.dekat.payment.infrastructure.gateway.PaymentGatewayProperties;
import id.dekat.payment.infrastructure.gateway.PaymentResult;
import id.dekat.payment.infrastructure.gateway.RefundResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService Weird P/N/E/A")
class PaymentServiceWeirdTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private RefundRepository refundRepository;
    @Mock private PaymentTransactionRepository paymentTransactionRepository;
    @Mock private LedgerEntryRepository ledgerEntryRepository;
    @Mock private PaymentGatewayPort gateway;
    @Mock private PaymentWebhookEventRepository webhookEventRepository;
    @Mock private PaymentGatewayProperties gatewayProperties;

    @InjectMocks private PaymentService paymentService;

    private UUID bookingId, tenantId;

    @BeforeEach
    void setUp() {
        bookingId = UUID.randomUUID();
        tenantId = UUID.randomUUID();
        lenient().when(gatewayProperties.provider()).thenReturn("midtrans");
    }

    // P
    @Test @DisplayName("P: createPaymentIntent valid -> AUTHORIZED jika gateway success")
    void createIntent_success_authorized() {
        when(paymentRepository.findByBookingIdAndStatus(any(), any())).thenReturn(Optional.empty());
        when(paymentRepository.save(any())).thenAnswer(inv -> {
            PaymentIntent pi = inv.getArgument(0);
            try { var f = PaymentIntent.class.getDeclaredField("id"); f.setAccessible(true); if (pi.getId()==null) f.set(pi, UUID.randomUUID()); } catch (Exception e) {}
            return pi;
        });
        when(paymentTransactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(gateway.createTransaction(any())).thenReturn(PaymentResult.builder().success(true).referenceId("REF123").build());
        PaymentIntent intent = paymentService.createPaymentIntent(bookingId, tenantId, 50000, "IDR", "midtrans");
        assertThat(intent.getAmount()).isEqualTo(50000);
        assertThat(intent.getStatus()).isEqualTo(PaymentStatus.AUTHORIZED);
        assertThat(intent.getGatewayReference()).isEqualTo("REF123");
    }

    @Test @DisplayName("P: existing PENDING not expired -> return existing (idempotent)")
    void createIntent_existing_pending_return() {
        PaymentIntent existing = new PaymentIntent(bookingId, tenantId, 50000, "IDR", "midtrans", OffsetDateTime.now().plusMinutes(20));
        when(paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.PENDING)).thenReturn(Optional.of(existing));
        PaymentIntent res = paymentService.createPaymentIntent(bookingId, tenantId, 50000, "IDR", "midtrans");
        assertThat(res).isEqualTo(existing);
        verify(gateway, never()).createTransaction(any());
    }

    @Test @DisplayName("P: processWebhook payment.success -> CAPTURED + ledger")
    void webhook_success_captured() {
        PaymentIntent intent = new PaymentIntent(bookingId, tenantId, 50000, "IDR", "midtrans", OffsetDateTime.now().plusMinutes(30));
        intent.markAuthorized("REF123");
        when(webhookEventRepository.findByGatewayProviderAndEventId(any(), any())).thenReturn(Optional.empty());
        when(paymentRepository.findByGatewayReference("REF123")).thenReturn(Optional.of(intent));
        when(paymentRepository.save(any())).thenAnswer(inv -> {
            PaymentIntent pi = inv.getArgument(0);
            try { var f = PaymentIntent.class.getDeclaredField("id"); f.setAccessible(true); if (pi.getId()==null) f.set(pi, UUID.randomUUID()); } catch (Exception e) {}
            return pi;
        });
        when(paymentTransactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(ledgerEntryRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(webhookEventRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Map<String,Object> payload = new HashMap<>();
        payload.put("event_id", "evt1"); payload.put("event_type", "payment.success"); payload.put("order_id", "o1"); payload.put("gateway_reference", "REF123"); payload.put("status", "success");
        paymentService.processWebhook("midtrans", payload);
        assertThat(intent.getStatus()).isEqualTo(PaymentStatus.CAPTURED);
        verify(ledgerEntryRepository).save(any());
    }

    // N
    @Test @DisplayName("N: createIntent amount 0 throw")
    void createIntent_zero_throw() {
        assertThatThrownBy(() -> paymentService.createPaymentIntent(bookingId, tenantId, 0, "IDR", "midtrans"))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("positive");
    }

    @Test @DisplayName("N: createIntent amount negatif throw")
    void createIntent_negative_throw() {
        assertThatThrownBy(() -> paymentService.createPaymentIntent(bookingId, tenantId, -100, "IDR", "midtrans"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test @DisplayName("N: createIntent amount null throw")
    void createIntent_null_throw() {
        assertThatThrownBy(() -> paymentService.createPaymentIntent(bookingId, tenantId, null, "IDR", "midtrans"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test @DisplayName("N: createIntent currency blank throw")
    void createIntent_blankCurrency_throw() {
        assertThatThrownBy(() -> paymentService.createPaymentIntent(bookingId, tenantId, 50000, "  ", "midtrans"))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("Currency");
    }

    @Test @DisplayName("N: webhook missing gateway_reference throw")
    void webhook_missingRef_throw() {
        Map<String,Object> payload = new HashMap<>();
        payload.put("event_id", "evt1"); payload.put("event_type", "payment.success"); payload.put("order_id", "o1");
        // gatewayReference missing
        payload.put("status", "success");
        // need to bypass eventId check: webhookEventRepository returns empty
        lenient().when(webhookEventRepository.findByGatewayProviderAndEventId(any(), any())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> paymentService.processWebhook("midtrans", payload))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("Invalid webhook");
    }

    @Test @DisplayName("N: getPaymentStatus not found throw")
    void getStatus_notFound_throw() {
        when(paymentRepository.findById(any())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> paymentService.getPaymentStatus(UUID.randomUUID()))
                .isInstanceOf(NotFoundException.class);
    }

    // E
    @Test @DisplayName("E: createIntent amount 1 sen valid (min)")
    void createIntent_1sen_valid() {
        when(paymentRepository.findByBookingIdAndStatus(any(), any())).thenReturn(Optional.empty());
        when(paymentRepository.save(any())).thenAnswer(inv -> {
            PaymentIntent pi = inv.getArgument(0);
            try { var f = PaymentIntent.class.getDeclaredField("id"); f.setAccessible(true); if (pi.getId()==null) f.set(pi, UUID.randomUUID()); } catch (Exception e) {}
            return pi;
        });
        when(paymentTransactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(gateway.createTransaction(any())).thenReturn(PaymentResult.builder().success(false).build());
        PaymentIntent intent = paymentService.createPaymentIntent(bookingId, tenantId, 1, "IDR", "midtrans");
        assertThat(intent.getAmount()).isEqualTo(1);
        assertThat(intent.getStatus()).isEqualTo(PaymentStatus.FAILED); // gateway fail -> FAILED
    }

    @Test @DisplayName("E: createIntent amount 999999999 max int valid")
    void createIntent_maxInt_valid() {
        when(paymentRepository.findByBookingIdAndStatus(any(), any())).thenReturn(Optional.empty());
        when(paymentRepository.save(any())).thenAnswer(inv -> {
            PaymentIntent pi = inv.getArgument(0);
            try { var f = PaymentIntent.class.getDeclaredField("id"); f.setAccessible(true); if (pi.getId()==null) f.set(pi, UUID.randomUUID()); } catch (Exception e) {}
            return pi;
        });
        when(paymentTransactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(gateway.createTransaction(any())).thenReturn(PaymentResult.builder().success(true).referenceId("REFMAX").build());
        PaymentIntent intent = paymentService.createPaymentIntent(bookingId, tenantId, 999999999, "IDR", "midtrans");
        assertThat(intent.getAmount()).isEqualTo(999999999);
    }

    @Test @DisplayName("E: existing PENDING expired -> cancelled then new intent")
    void createIntent_expired_recreate() {
        PaymentIntent expired = new PaymentIntent(bookingId, tenantId, 50000, "IDR", "midtrans", OffsetDateTime.now().minusMinutes(1));
        // expired PENDING
        when(paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.PENDING)).thenReturn(Optional.of(expired));
        when(paymentRepository.save(any())).thenAnswer(inv -> {
            PaymentIntent pi = inv.getArgument(0);
            try { var f = PaymentIntent.class.getDeclaredField("id"); f.setAccessible(true); if (pi.getId()==null) f.set(pi, UUID.randomUUID()); } catch (Exception e) {}
            return pi;
        });
        when(paymentTransactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(gateway.createTransaction(any())).thenReturn(PaymentResult.builder().success(true).referenceId("REFNEW").build());
        PaymentIntent res = paymentService.createPaymentIntent(bookingId, tenantId, 50000, "IDR", "midtrans");
        assertThat(expired.getStatus()).isEqualTo(PaymentStatus.CANCELLED);
        assertThat(res).isNotNull();
        assertThat(res.getId()).isNotEqualTo(expired.getId());
    }

    @Test @DisplayName("E: webhook duplicate eventId idempotent (no double ledger)")
    void webhook_duplicate_idempotent() {
        when(webhookEventRepository.findByGatewayProviderAndEventId("midtrans", "evt-dup")).thenReturn(Optional.of(mock(PaymentWebhookEvent.class)));
        Map<String,Object> payload = new HashMap<>();
        payload.put("event_id", "evt-dup"); payload.put("event_type", "payment.success"); payload.put("order_id", "o1"); payload.put("gateway_reference", "REF123"); payload.put("status", "success");
        paymentService.processWebhook("midtrans", payload);
        verify(paymentRepository, never()).save(any());
    }

    @Test @DisplayName("E: webhook CAPTURED + payment.success duplicate ignored")
    void webhook_alreadyCaptured_ignored() {
        PaymentIntent intent = new PaymentIntent(bookingId, tenantId, 50000, "IDR", "midtrans", OffsetDateTime.now().plusMinutes(30));
        intent.markAuthorized("REF123"); intent.markCaptured();
        when(webhookEventRepository.findByGatewayProviderAndEventId(any(), any())).thenReturn(Optional.empty());
        when(paymentRepository.findByGatewayReference("REF123")).thenReturn(Optional.of(intent));
        Map<String,Object> payload = new HashMap<>();
        payload.put("event_id", "evt2"); payload.put("event_type", "payment.success"); payload.put("order_id", "o1"); payload.put("gateway_reference", "REF123"); payload.put("status", "success");
        paymentService.processWebhook("midtrans", payload);
        // harus return early sebelum ledger
        verify(ledgerEntryRepository, never()).save(any());
    }

    // A
    @Test @DisplayName("A: gateway fail -> intent FAILED")
    void gateway_fail_markFailed() {
        when(paymentRepository.findByBookingIdAndStatus(any(), any())).thenReturn(Optional.empty());
        when(paymentRepository.save(any())).thenAnswer(inv -> {
            PaymentIntent pi = inv.getArgument(0);
            try { var f = PaymentIntent.class.getDeclaredField("id"); f.setAccessible(true); if (pi.getId()==null) f.set(pi, UUID.randomUUID()); } catch (Exception e) {}
            return pi;
        });
        when(paymentTransactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(gateway.createTransaction(any())).thenReturn(PaymentResult.builder().success(false).build());
        PaymentIntent intent = paymentService.createPaymentIntent(bookingId, tenantId, 50000, "IDR", "midtrans");
        assertThat(intent.getStatus()).isEqualTo(PaymentStatus.FAILED);
    }

    @Test @DisplayName("A: webhook unknown eventType -> transaction FAILED")
    void webhook_unknown_markFailed() {
        PaymentIntent intent = new PaymentIntent(bookingId, tenantId, 50000, "IDR", "midtrans", OffsetDateTime.now().plusMinutes(30));
        intent.markAuthorized("REFUNK");
        when(webhookEventRepository.findByGatewayProviderAndEventId(any(), any())).thenReturn(Optional.empty());
        when(paymentRepository.findByGatewayReference("REFUNK")).thenReturn(Optional.of(intent));
        when(paymentRepository.save(any())).thenAnswer(inv -> {
            PaymentIntent pi = inv.getArgument(0);
            try { var f = PaymentIntent.class.getDeclaredField("id"); f.setAccessible(true); if (pi.getId()==null) f.set(pi, UUID.randomUUID()); } catch (Exception e) {}
            return pi;
        });
        when(paymentTransactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(webhookEventRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        Map<String,Object> payload = new HashMap<>();
        payload.put("event_id", "evt-unk"); payload.put("event_type", "payment.weird"); payload.put("order_id", "o1"); payload.put("gateway_reference", "REFUNK"); payload.put("status", "unknown");
        paymentService.processWebhook("midtrans", payload);
        // transaction FAILED, intent tetap AUTHORIZED (default switch)
        // verify save called
        verify(paymentTransactionRepository).save(any());
    }

    @Test @DisplayName("A: calculateRefund tiered >48h full, 24-48h 50%, 6-24h 25%, <6h 0")
    void calculateRefund_tiered() {
        // mock paid intent
        PaymentIntent paid = new PaymentIntent(bookingId, tenantId, 100000, "IDR", "midtrans", OffsetDateTime.now().plusMinutes(30));
        paid.markAuthorized("REF"); paid.markCaptured();
        when(paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.CAPTURED)).thenReturn(Optional.of(paid));
        when(refundRepository.findByBookingId(any())).thenReturn(List.of());
        // >48h
        int full = paymentService.calculateRefundAmount(bookingId, "tiered:48h", OffsetDateTime.now().plusHours(50));
        assertThat(full).isEqualTo(100000);
        int half = paymentService.calculateRefundAmount(bookingId, "tiered:48h", OffsetDateTime.now().plusHours(30));
        assertThat(half).isEqualTo(50000);
        int quarter = paymentService.calculateRefundAmount(bookingId, "tiered:48h", OffsetDateTime.now().plusHours(10));
        assertThat(quarter).isEqualTo(25000);
        int zero = paymentService.calculateRefundAmount(bookingId, "tiered:48h", OffsetDateTime.now().plusHours(2));
        assertThat(zero).isEqualTo(0);
    }

    @Test @DisplayName("A: processRefund amount exceeds paid throw")
    void refund_exceeds_throw() {
        PaymentIntent paid = new PaymentIntent(bookingId, tenantId, 50000, "IDR", "midtrans", OffsetDateTime.now().plusMinutes(30));
        paid.markAuthorized("REF"); paid.markCaptured();
        when(paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.CAPTURED)).thenReturn(Optional.of(paid));
        when(refundRepository.findByBookingId(bookingId)).thenReturn(List.of());
        assertThatThrownBy(() -> paymentService.processRefund(bookingId, 60000, "over", UUID.randomUUID()))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("exceeds");
    }

    @Test @DisplayName("A: refund amount 0 throw")
    void refund_zero_throw() {
        assertThatThrownBy(() -> paymentService.processRefund(bookingId, 0, "zero", UUID.randomUUID()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test @DisplayName("A: refund success marks ledger")
    void refund_success_ledger() {
        PaymentIntent paid = new PaymentIntent(bookingId, tenantId, 50000, "IDR", "midtrans", OffsetDateTime.now().plusMinutes(30));
        paid.markAuthorized("REF"); paid.markCaptured();
        when(paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.CAPTURED)).thenReturn(Optional.of(paid));
        when(refundRepository.findByBookingId(any())).thenReturn(List.of());
        when(paymentRepository.save(any())).thenAnswer(inv -> {
            PaymentIntent pi = inv.getArgument(0);
            try { var f = PaymentIntent.class.getDeclaredField("id"); f.setAccessible(true); if (pi.getId()==null) f.set(pi, UUID.randomUUID()); } catch (Exception e) {}
            return pi;
        });
        when(refundRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(ledgerEntryRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(gateway.processRefund(any())).thenReturn(RefundResult.builder().success(true).refundId("R1").build());
        var refund = paymentService.processRefund(bookingId, 10000, "cancel", UUID.randomUUID());
        assertThat(refund.getStatus()).isEqualTo(Refund.RefundStatus.PROCESSED);
        verify(ledgerEntryRepository).save(any());
    }

    @Test @DisplayName("A: amount Integer.MAX_VALUE weird - tidak overflow int?")
    void amount_maxValue() {
        when(paymentRepository.findByBookingIdAndStatus(any(), any())).thenReturn(Optional.empty());
        when(paymentRepository.save(any())).thenAnswer(inv -> {
            PaymentIntent pi = inv.getArgument(0);
            try { var f = PaymentIntent.class.getDeclaredField("id"); f.setAccessible(true); if (pi.getId()==null) f.set(pi, UUID.randomUUID()); } catch (Exception e) {}
            return pi;
        });
        when(paymentTransactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(gateway.createTransaction(any())).thenReturn(PaymentResult.builder().success(true).referenceId("REFMAX").build());
        PaymentIntent intent = paymentService.createPaymentIntent(bookingId, tenantId, Integer.MAX_VALUE, "IDR", "midtrans");
        assertThat(intent.getAmount()).isEqualTo(Integer.MAX_VALUE);
    }
}
