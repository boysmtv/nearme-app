package id.dekat.booking.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Optional<Booking> findByTenantIdAndId(UUID tenantId, UUID id);

    Optional<Booking> findByBookingCode(String bookingCode);

    Page<Booking> findAll(Pageable pageable);

    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    Page<Booking> findByTenantId(UUID tenantId, Pageable pageable);

    Page<Booking> findByTenantIdAndStatus(UUID tenantId, BookingStatus status, Pageable pageable);

    Page<Booking> findByCustomerId(UUID customerId, Pageable pageable);

    Page<Booking> findByCustomerIdAndStatus(UUID customerId, BookingStatus status, Pageable pageable);

    List<Booking> findByTenantId(UUID tenantId);

    List<Booking> findByTenantIdAndStartsAtBetween(UUID tenantId, OffsetDateTime startsAt, OffsetDateTime endsAt);

    List<Booking> findByCustomerIdAndStartsAtBetween(UUID customerId, OffsetDateTime startsAt, OffsetDateTime endsAt);

    List<Booking> findByStartsAtBetween(OffsetDateTime start, OffsetDateTime end);

    List<Booking> findByStartsAtBetweenAndStatus(OffsetDateTime start, OffsetDateTime end, BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.startsAt BETWEEN :from AND :to AND b.status = :status")
    List<Booking> findUpcoming(@Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to, @Param("status") BookingStatus status);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.tenantId = :tenantId
          AND b.status NOT IN :excludedStatuses
          AND b.startsAt < :endsAt
          AND b.endsAt > :startsAt
    """)
    java.util.List<Booking> findOverlappingBookings(
        @Param("tenantId") UUID tenantId,
        @Param("startsAt") OffsetDateTime startsAt,
        @Param("endsAt") OffsetDateTime endsAt,
        @Param("excludedStatuses") List<BookingStatus> excludedStatuses
    );

    @Query("""
        SELECT b FROM Booking b
        WHERE b.tenantId = :tenantId
          AND b.status NOT IN :excludedStatuses
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
        @Param("endsAt") OffsetDateTime endsAt,
        @Param("excludedStatuses") List<BookingStatus> excludedStatuses
    );

    long countByCreatedAtAfter(OffsetDateTime date);

    long countByCreatedAtBetween(OffsetDateTime start, OffsetDateTime end);

    List<Booking> findByStatusAndCreatedAtAfter(BookingStatus status, OffsetDateTime date);

    List<Booking> findByStatusAndCreatedAtBetween(BookingStatus status, OffsetDateTime start, OffsetDateTime end);
}
