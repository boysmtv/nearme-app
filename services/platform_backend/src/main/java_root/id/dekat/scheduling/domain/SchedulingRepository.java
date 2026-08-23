package id.dekat.scheduling.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface SchedulingRepository extends JpaRepository<AvailabilityRule, UUID> {

    List<AvailabilityRule> findByTenantIdAndStaffId(UUID tenantId, UUID staffId);

    List<AvailabilityRule> findByTenantIdAndDayOfWeekAndEffectiveFromLessThanEqualAndEffectiveUntilGreaterThanEqual(
            UUID tenantId, DayOfWeek dayOfWeek, Instant date, Instant date2);

    @Query("SELECT a FROM AvailabilityRule a WHERE a.tenantId = :tenantId " +
           "AND a.staffId = :staffId AND a.dayOfWeek = :dayOfWeek " +
           "AND a.effectiveFrom <= :date AND (a.effectiveUntil IS NULL OR a.effectiveUntil >= :date)")
    List<AvailabilityRule> findActiveRules(@Param("tenantId") UUID tenantId,
                                            @Param("staffId") UUID staffId,
                                            @Param("dayOfWeek") DayOfWeek dayOfWeek,
                                            @Param("date") Instant date);
}
