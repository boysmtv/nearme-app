package id.dekat.booking.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Optional<Booking> findByTenantIdAndId(UUID tenantId, UUID id);

    Optional<Booking> findByBookingCode(String bookingCode);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.tenantId = :tenantId
          AND b.status NOT IN (id.dekat.booking.domain.BookingStatus.CANCELLED,
                               id.dekat.booking.domain.BookingStatus.EXPIRED)
          AND b.startsAt < :endsAt
          AND b.endsAt > :startsAt
    """)
    java.util.List<Booking> findOverlappingBookings(
        @Param("tenantId") UUID tenantId,
        @Param("startsAt") OffsetDateTime startsAt,
        @Param("endsAt") OffsetDateTime endsAt
    );

    @Query("""
        SELECT b FROM Booking b
        WHERE b.tenantId = :tenantId
          AND b.status NOT IN (id.dekat.booking.domain.BookingStatus.CANCELLED,
                               id.dekat.booking.domain.BookingStatus.EXPIRED)
          AND EXISTS (
              SELECT ba FROM BookingAssignment ba
              WHERE ba.bookingId = b.id
                AND ba.staffId = :staffId
          )
          AND b.startsAt < :endsAt
          AND b.endsAt > :startsAt
    """)
    java.util.List<Booking> findOverlappingBookingsForStaff(
        @Param("tenantId") UUID tenantId,
        @Param("staffId") UUID staffId,
        @Param("startsAt") OffsetDateTime startsAt,
        @Param("endsAt") OffsetDateTime endsAt
    );
}
