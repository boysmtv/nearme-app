package id.dekat.notification.application;

import id.dekat.booking.domain.Booking;
import id.dekat.booking.domain.BookingRepository;
import id.dekat.booking.domain.BookingStatus;
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
public class BookingReminderScheduler {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    @Scheduled(fixedRate = 300000) // every 5 minutes
    @Transactional
    public void sendUpcomingReminders() {
        OffsetDateTime now = OffsetDateTime.now();
        // H-24: bookings starting in 24h ± 5min
        checkAndSend(now.plusHours(24), 24);
        // H-2: bookings starting in 2h ± 5min
        checkAndSend(now.plusHours(2), 2);
    }

    private void checkAndSend(OffsetDateTime target, int hoursBefore) {
        OffsetDateTime windowStart = target.minusMinutes(5);
        OffsetDateTime windowEnd = target.plusMinutes(5);
        List<Booking> upcoming = bookingRepository.findUpcoming(windowStart, windowEnd, BookingStatus.CONFIRMED);
        for (Booking b : upcoming) {
            try {
                notificationService.sendReminder(
                    b.getTenantId(),
                    b.getCustomerId(),
                    b.getBookingCode(),
                    null,
                    null,
                    b.getStartsAt() != null ? b.getStartsAt().toInstant() : null,
                    hoursBefore
                );
                log.info("[ReminderScheduler] Sent H-{} reminder for booking {} at {}", hoursBefore, b.getBookingCode(), b.getStartsAt());
            } catch (Exception e) {
                log.warn("[ReminderScheduler] Failed to send H-{} for {}: {}", hoursBefore, b.getId(), e.getMessage());
            }
        }
        if (!upcoming.isEmpty()) {
            log.info("[ReminderScheduler] H-{} processed {} bookings (window {} to {})", hoursBefore, upcoming.size(), windowStart, windowEnd);
        }
    }
}
