package id.dekat.booking.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingHoldRepository extends JpaRepository<BookingHold, UUID> {

    List<BookingHold> findByStatus(BookingHold.HoldStatus status);

    @Modifying
    @Query("""
        UPDATE BookingHold h SET h.status = 'EXPIRED'
        WHERE h.status = 'ACTIVE'
          AND h.expiresAt < :now
    """)
    int expireHolds(@Param("now") OffsetDateTime now);

    @Query("""
        SELECT h FROM BookingHold h
        WHERE h.tenantId = :tenantId
          AND h.status = 'ACTIVE'
          AND h.startsAt < :endsAt
          AND h.endsAt > :startsAt
    """)
    List<BookingHold> findOverlappingHolds(
        @Param("tenantId") UUID tenantId,
        @Param("startsAt") OffsetDateTime startsAt,
        @Param("endsAt") OffsetDateTime endsAt
    );
}
