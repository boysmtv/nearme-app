package id.dekat.review.application;

import id.dekat.booking.domain.Booking;
import id.dekat.booking.domain.BookingRepository;
import id.dekat.booking.domain.BookingStatus;
import id.dekat.identity.domain.User;
import id.dekat.identity.domain.UserRepository;
import id.dekat.notification.application.NotificationService;
import id.dekat.review.domain.Review;
import id.dekat.review.domain.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewRequestService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ReviewRepository reviewRepository;

    @Transactional
    public void requestReview(UUID bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking == null || booking.getStatus() != BookingStatus.COMPLETED) return;

            // Check if already reviewed
            boolean alreadyReviewed = reviewRepository.existsByBookingId(bookingId);
            if (alreadyReviewed) return;

            User customer = userRepository.findById(booking.getCustomerId()).orElse(null);
            if (customer == null || customer.getEmail() == null) return;

            log.info("[ReviewRequest] Sending review request for booking {} to {}", bookingId, customer.getEmail());

            // In production: send email/WhatsApp with review link
            // For now, just log the intent
            Map<String, String> vars = Map.of(
                    "bookingCode", booking.getBookingCode(),
                    "reviewUrl", "/bookings/" + bookingId + "/review"
            );

            // notificationService sends push notification
            notificationService.sendBookingConfirmation(
                    booking.getTenantId(),
                    booking.getCustomerId(),
                    booking.getBookingCode(),
                    "Bagaimana layanan kami?",
                    "Provider",
                    booking.getStartsAt() != null ? booking.getStartsAt().toInstant() : null
            );

            log.info("[ReviewRequest] Review request sent for booking {}", bookingId);
        } catch (Exception e) {
            log.warn("[ReviewRequest] Failed to send review request for {}: {}", bookingId, e.getMessage());
        }
    }

    @Scheduled(fixedRate = 3600000) // Every hour
    public void sendPendingReviewRequests() {
        try {
            OffsetDateTime twoHoursAgo = OffsetDateTime.now().minusHours(2);
            OffsetDateTime twentyFourHoursAgo = OffsetDateTime.now().minusHours(24);

            List<Booking> completedBookings = bookingRepository.findByStatusAndCreatedAtAfter(
                    BookingStatus.COMPLETED, twentyFourHoursAgo);

            for (Booking booking : completedBookings) {
                if (booking.getEndsAt() != null && booking.getEndsAt().isBefore(twoHoursAgo)) {
                    boolean alreadyReviewed = reviewRepository.existsByBookingId(booking.getId());
                    if (!alreadyReviewed) {
                        requestReview(booking.getId());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("[ReviewRequest] Scheduled review request failed: {}", e.getMessage());
        }
    }
}
