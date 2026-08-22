package id.dekat.staff.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface StaffScheduleRepository extends JpaRepository<StaffSchedule, UUID> {

    List<StaffSchedule> findByStaffIdAndEffectiveFromLessThanEqualAndEffectiveUntilGreaterThanEqual(
            UUID staffId, Instant date, Instant date2);

    List<StaffSchedule> findByStaffId(UUID staffId);
}
