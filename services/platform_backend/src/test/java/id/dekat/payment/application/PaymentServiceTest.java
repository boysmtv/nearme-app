package id.dekat.payment.application;

import id.dekat.common.NotFoundException;
import id.dekat.payment.domain.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService")
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private RefundRepository refundRepository;
    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;
    @Mock
    private LedgerEntryRepository ledgerEntryRepository;

    @InjectMocks
    private PaymentService paymentService;

    private UUID bookingId;
    private UUID tenantId;
    private UUID approverId;
    private OffsetDateTime now;

    @BeforeEach
    void setUp() {
        bookingId = UUID.randomUUID();
        tenantId = UUID.randomUUID();
        approverId = UUID.randomUUID();
        now = OffsetDateTime.now();
    }

    @Nested
    @DisplayName("createPaymentIntent")
    class CreatePaymentIntentTests {

        @Test
        @DisplayName("should create payment intent successfully")
        void testCreatePaymentIntent_Success() {
            when(paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.PENDING))
                    .thenReturn(Optional.empty());
            when(paymentRepository.save(any(PaymentIntent.class)))
                    .thenAnswer(invocation -> {
                        PaymentIntent p = invocation.getArgument(0);
                        p.setId(UUID.randomUUID());
                        return p;
                    });
            when(paymentTransactionRepository.save(any(PaymentTransaction.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            PaymentIntent result = paymentService.createPaymentIntent(
                    bookingId, tenantId, new BigDecimal("150000"), "IDR", "VA");

            assertThat(result).isNotNull();
            assertThat(result.getBookingId()).isEqualTo(bookingId);
            assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("150000"));
            assertThat(result.getCurrency()).isEqualTo("IDR");
            assertThat(result.getStatus()).isEqualTo(PaymentStatus.CREATED);
            verify(paymentTransactionRepository).save(any(PaymentTransaction.class));
        }

        @Test
        @DisplayName("should return existing pending intent when not expired")
        void testCreatePaymentIntent_Idempotent() {
            PaymentIntent existing = createPendingPaymentIntent();
            when(paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.PENDING))
                    .thenReturn(Optional.of(existing));

            PaymentIntent result = paymentService.createPaymentIntent(
                    bookingId, tenantId, new BigDecimal("150000"), "IDR", "VA");

            assertThat(result.getId()).isEqualTo(existing.getId());
            verify(paymentRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("processWebhook")
    class ProcessWebhookTests {

        @Test
        @DisplayName("should process payment success webhook")
        void testProcessWebhook_Success() {
            PaymentIntent intent = createPendingPaymentIntent();
            intent.setGatewayReference("gw-ref-001");
            intent.setStatus(PaymentStatus.PENDING);

            when(paymentRepository.findByGatewayReference("gw-ref-001"))
                    .thenReturn(Optional.of(intent));
            when(paymentTransactionRepository.save(any(PaymentTransaction.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));
            when(paymentRepository.save(any(PaymentIntent.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            Map<String, Object> payload = new HashMap<>();
            payload.put("gateway_reference", "gw-ref-001");
            payload.put("event_type", "payment.success");
            payload.put("order_id", "DKT-001");

            paymentService.processWebhook("midtrans", payload);

            verify(paymentRepository).save(argThat(p ->
                    PaymentStatus.PAID.equals(p.getStatus())));
            verify(ledgerEntryRepository).save(argThat(e ->
                    LedgerEntry.EntryType.PAYMENT.equals(e.getEntryType())));
        }

        @Test
        @DisplayName("should skip duplicate success webhook")
        void testProcessWebhook_Duplicate() {
            PaymentIntent intent = createPendingPaymentIntent();
            intent.setStatus(PaymentStatus.PAID);

            when(paymentRepository.findByGatewayReference("gw-ref-001"))
                    .thenReturn(Optional.of(intent));

            Map<String, Object> payload = new HashMap<>();
            payload.put("gateway_reference", "gw-ref-001");
            payload.put("event_type", "payment.success");

            paymentService.processWebhook("midtrans", payload);

            verify(paymentRepository, never()).save(any());
            verify(paymentTransactionRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw on invalid webhook payload")
        void testProcessWebhook_InvalidSignature() {
            Map<String, Object> payload = new HashMap<>();
            payload.put("event_type", "payment.success");
            // missing gateway_reference

            assertThatThrownBy(() ->
                    paymentService.processWebhook("midtrans", payload))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("missing gateway_reference");
        }
    }

    @Nested
    @DisplayName("calculateRefundAmount")
    class CalculateRefundAmountTests {

        @Test
        @DisplayName("should calculate full refund when policy is full_refund")
        void testCalculateRefundAmount_FullRefund() {
            PaymentIntent paidIntent = createPaidPaymentIntent(new BigDecimal("200000"));
            when(refundRepository.findByBookingId(bookingId)).thenReturn(Collections.emptyList());
            when(paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.PAID))
                    .thenReturn(Optional.of(paidIntent));

            BigDecimal refundAmount = paymentService.calculateRefundAmount(
                    bookingId, "full_refund", now.plusDays(3));

            assertThat(refundAmount).isEqualByComparingTo(new BigDecimal("200000"));
        }

        @Test
        @DisplayName("should return zero when policy is no_refund")
        void testCalculateRefundAmount_NoRefund() {
            PaymentIntent paidIntent = createPaidPaymentIntent(new BigDecimal("200000"));
            when(refundRepository.findByBookingId(bookingId)).thenReturn(Collections.emptyList());
            when(paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.PAID))
                    .thenReturn(Optional.of(paidIntent));

            BigDecimal refundAmount = paymentService.calculateRefundAmount(
                    bookingId, "no_refund", now.plusDays(3));

            assertThat(refundAmount).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }

    @Nested
    @DisplayName("processRefund")
    class ProcessRefundTests {

        @Test
        @DisplayName("should process refund successfully")
        void testProcessRefund_Success() {
            PaymentIntent paidIntent = createPaidPaymentIntent(new BigDecimal("200000"));
            when(paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.PAID))
                    .thenReturn(Optional.of(paidIntent));
            when(refundRepository.findByBookingId(bookingId)).thenReturn(Collections.emptyList());
            when(refundRepository.save(any(Refund.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));
            when(paymentRepository.save(any(PaymentIntent.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            Refund result = paymentService.processRefund(
                    bookingId, new BigDecimal("100000"), "Customer request", approverId);

            assertThat(result).isNotNull();
            assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("100000"));
            assertThat(result.getStatus()).isEqualTo(Refund.RefundStatus.APPROVED);
            verify(ledgerEntryRepository).save(any(LedgerEntry.class));
        }
    }

    // --- Helper methods ---

    private PaymentIntent createPendingPaymentIntent() {
        PaymentIntent intent = new PaymentIntent(
                bookingId, tenantId, new BigDecimal("150000"), "IDR", "VA",
                now.plusMinutes(30)
        );
        intent.setId(UUID.randomUUID());
        return intent;
    }

    private PaymentIntent createPaidPaymentIntent(BigDecimal amount) {
        PaymentIntent intent = new PaymentIntent(
                bookingId, tenantId, amount, "IDR", "VA", now.plusMinutes(30)
        );
        intent.setId(UUID.randomUUID());
        intent.markPaid();
        return intent;
    }
}