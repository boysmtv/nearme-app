package id.dekat.review.application;

import id.dekat.booking.domain.Booking;
import id.dekat.booking.domain.BookingRepository;
import id.dekat.booking.domain.BookingStatus;
import id.dekat.media.domain.MediaAsset;
import id.dekat.media.domain.MediaRepository;
import id.dekat.review.domain.Review;
import id.dekat.review.domain.ReviewPhoto;
import id.dekat.review.domain.ReviewPhotoRepository;
import id.dekat.review.domain.ReviewRepository;
import id.dekat.review.domain.ReviewResponseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReviewService Photos + Verified Tests")
class ReviewServicePhotoTest {

    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private ReviewResponseRepository reviewResponseRepository;
    @Mock
    private ReviewPhotoRepository reviewPhotoRepository;
    @Mock
    private MediaRepository mediaRepository;
    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private ReviewService reviewService;

    private UUID bookingId, customerId, tenantId;

    @BeforeEach
    void setUp() {
        bookingId = UUID.randomUUID();
        customerId = UUID.randomUUID();
        tenantId = UUID.randomUUID();
    }

    @Test
    @DisplayName("createReview with photos links media")
    void createReview_withPhotos_linksMedia() {
        when(reviewRepository.existsByBookingIdAndCustomerId(any(), any())).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
            Review r = inv.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });
        UUID m1 = UUID.randomUUID();
        MediaAsset a1 = MediaAsset.builder().id(m1).ownerType("provider").ownerId(tenantId).fileName("a.jpg").contentType("image/jpeg").fileSize(1L).storagePath("/tmp/a.jpg").url("/uploads/a.jpg").build();
        when(mediaRepository.findById(m1)).thenReturn(Optional.of(a1));
        when(mediaRepository.save(any(MediaAsset.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewPhotoRepository.save(any(ReviewPhoto.class))).thenAnswer(inv -> inv.getArgument(0));

        Review result = reviewService.createReview(bookingId, customerId, tenantId, 5, "Great", "Nice", List.of(m1));

        assertThat(result).isNotNull();
        verify(mediaRepository).save(argThat(m -> "review".equals(m.getOwnerType())));
        verify(reviewPhotoRepository).save(any(ReviewPhoto.class));
    }

    @Test
    @DisplayName("createReview rejects too many photos")
    void createReview_tooManyPhotos_throws() {
        when(reviewRepository.existsByBookingIdAndCustomerId(any(), any())).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
            Review r = inv.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });
        List<UUID> many = List.of(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());
        assertThatThrownBy(() -> reviewService.createReview(bookingId, customerId, tenantId, 5, "t", "b", many))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Maximum 8 photos");
    }

    @Test
    @DisplayName("isVerifiedBooking true when booking COMPLETED and same customer tenant")
    void isVerified_trueWhenCompleted() {
        Booking b = mock(Booking.class);
        when(b.getCustomerId()).thenReturn(customerId);
        when(b.getTenantId()).thenReturn(tenantId);
        when(b.getStatus()).thenReturn(BookingStatus.COMPLETED);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(b));

        assertThat(reviewService.isVerifiedBooking(bookingId, customerId, tenantId)).isTrue();
    }

    @Test
    @DisplayName("isVerified false when status not COMPLETED")
    void isVerified_falseWhenNotCompleted() {
        Booking b = mock(Booking.class);
        when(b.getCustomerId()).thenReturn(customerId);
        when(b.getTenantId()).thenReturn(tenantId);
        when(b.getStatus()).thenReturn(BookingStatus.CONFIRMED);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(b));

        assertThat(reviewService.isVerifiedBooking(bookingId, customerId, tenantId)).isFalse();
    }

    @Test
    @DisplayName("addPhotoToReview succeeds")
    void addPhoto_succeeds() {
        UUID reviewId = UUID.randomUUID();
        UUID mediaId = UUID.randomUUID();
        Review review = mock(Review.class);
        when(reviewRepository.findById(reviewId)).thenReturn(Optional.of(review));
        when(reviewPhotoRepository.findByReviewId(reviewId)).thenReturn(List.of());
        MediaAsset asset = MediaAsset.builder().id(mediaId).ownerType("provider").ownerId(tenantId).fileName("a.jpg").contentType("image/jpeg").fileSize(1L).storagePath("/tmp/a.jpg").url("/uploads/a.jpg").build();
        when(mediaRepository.findById(mediaId)).thenReturn(Optional.of(asset));
        when(mediaRepository.save(any(MediaAsset.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewPhotoRepository.save(any(ReviewPhoto.class))).thenAnswer(inv -> inv.getArgument(0));

        ReviewPhoto rp = reviewService.addPhotoToReview(reviewId, mediaId);
        assertThat(rp).isNotNull();
    }

    @Test
    @DisplayName("addPhoto rejects when >8")
    void addPhoto_rejectsWhenTooMany() {
        UUID reviewId = UUID.randomUUID();
        when(reviewRepository.findById(reviewId)).thenReturn(Optional.of(mock(Review.class)));
        when(reviewPhotoRepository.findByReviewId(reviewId)).thenReturn(List.of(
                mock(ReviewPhoto.class), mock(ReviewPhoto.class), mock(ReviewPhoto.class), mock(ReviewPhoto.class),
                mock(ReviewPhoto.class), mock(ReviewPhoto.class), mock(ReviewPhoto.class), mock(ReviewPhoto.class)
        ));
        assertThatThrownBy(() -> reviewService.addPhotoToReview(reviewId, UUID.randomUUID()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Maximum 8 photos");
    }
}
