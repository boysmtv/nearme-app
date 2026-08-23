package id.dekat.staff.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface TimeOffRepository extends JpaRepository<TimeOff, UUID> {

    List<TimeOff> findByStaffIdAndStatus(UUID staffId, TimeOff.TimeOffStatus status);

    @Query("SELECT t FROM TimeOff t WHERE t.staffId = :staffId AND t.status = 'APPROVED' " +
           "AND t.startDate <= :endDate AND t.endDate >= :startDate")
    List<TimeOff> findApprovedOverlapping(@Param("staffId") UUID staffId,
                                           @Param("startDate") Instant startDate,
                                           @Param("endDate") Instant endDate);
}
