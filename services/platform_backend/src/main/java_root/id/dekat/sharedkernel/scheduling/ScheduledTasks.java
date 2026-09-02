package id.dekat.sharedkernel.scheduling;

import id.dekat.booking.domain.Booking;
import id.dekat.booking.domain.BookingRepository;
import id.dekat.booking.domain.BookingStatus;
import id.dekat.payment.domain.PaymentIntent;
import id.dekat.payment.domain.PaymentRepository;
import id.dekat.payment.domain.PaymentStatus;
import id.dekat.subscription.application.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final SubscriptionService subscriptionService;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void checkExpiredSubscriptions() {
        log.info("[Scheduler] Checking expired subscriptions...");
        subscriptionService.checkAndCancelExpiredSubscriptions();
    }

    @Scheduled(fixedRate = 300000) // every 5 minutes
    @Transactional
    public void autoMarkNoShow() {
        OffsetDateTime now = OffsetDateTime.now();
        List<Booking> activeBookings = bookingRepository.findAll().stream()
                .filter(b -> (b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.CHECKED_IN)
                        && b.getEndsAt() != null && b.getEndsAt().isBefore(now))
                .toList();

        for (Booking booking : activeBookings) {
            booking.setStatus(BookingStatus.NO_SHOW);
            bookingRepository.save(booking);
            log.info("[Scheduler] Auto-marked booking {} as NO_SHOW", booking.getBookingCode());
        }
    }

    @Scheduled(fixedRate = 300000) // every 5 minutes
    @Transactional
    public void cleanupStalePayments() {
        OffsetDateTime cutoff = OffsetDateTime.now().minusMinutes(30);
        List<PaymentIntent> stalePayments = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING
                        && p.getCreatedAt() != null && p.getCreatedAt().isBefore(cutoff))
                .toList();

        for (PaymentIntent payment : stalePayments) {
            payment.setStatus(PaymentStatus.CANCELLED);
            paymentRepository.save(payment);
            log.info("[Scheduler] Expired stale payment intent {}", payment.getId());
        }
    }
}
