package id.dekat.staff.application;

import id.dekat.staff.domain.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;
    private final StaffScheduleRepository staffScheduleRepository;
    private final TimeOffRepository timeOffRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public Staff inviteStaff(UUID tenantId, String displayName, String email, String phone) {
        UUID userId = findUserIdByEmail(email);
        Staff staff = Staff.builder()
                .tenantId(tenantId)
                .userId(userId)
                .displayName(displayName)
                .isActive(true)
                .build();

        return staffRepository.save(staff);
    }

    private UUID findUserIdByEmail(String email) {
        try {
            Object result = entityManager.createNativeQuery("SELECT id FROM users WHERE email = :email")
                    .setParameter("email", email)
                    .getSingleResult();
            return (UUID) result;
        } catch (Exception e) {
            throw new IllegalArgumentException("No registered user found with email: " + email);
        }
    }

    @Transactional
    public Staff activateStaff(UUID staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found: " + staffId));

        if (Boolean.TRUE.equals(staff.getIsActive())) {
            throw new IllegalStateException("Staff is already active");
        }

        staff.setIsActive(true);
        return staffRepository.save(staff);
    }

    @Transactional
    public Staff deactivateStaff(UUID staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found: " + staffId));

        if (Boolean.FALSE.equals(staff.getIsActive())) {
            throw new IllegalStateException("Staff is already inactive");
        }

        staff.setIsActive(false);
        return staffRepository.save(staff);
    }

    @Transactional
    public TimeOff requestTimeOff(UUID staffId, Instant startDate, Instant endDate, String reason) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found: " + staffId));

        if (!Boolean.TRUE.equals(staff.getIsActive())) {
            throw new IllegalStateException("Only active staff can request time off");
        }

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        // Check for overlapping approved time off
        List<TimeOff> overlapping = timeOffRepository.findApprovedOverlapping(staffId, startDate, endDate);
        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Time off request overlaps with existing approved time off");
        }

        TimeOff timeOff = TimeOff.builder()
                .staffId(staffId)
                .startDate(startDate)
                .endDate(endDate)
                .reason(reason)
                .status(TimeOff.TimeOffStatus.PENDING)
                .build();

        return timeOffRepository.save(timeOff);
    }

    @Transactional
    public TimeOff updateTimeOffStatus(UUID timeOffId, TimeOff.TimeOffStatus newStatus, UUID approverId) {
        TimeOff timeOff = timeOffRepository.findById(timeOffId)
                .orElseThrow(() -> new IllegalArgumentException("Time off not found: " + timeOffId));

        if (timeOff.getStatus() != TimeOff.TimeOffStatus.PENDING) {
            throw new IllegalStateException("Only pending time off requests can be updated");
        }

        if (newStatus == TimeOff.TimeOffStatus.APPROVED) {
            // Check for conflicts with existing bookings
            List<TimeOff> overlapping = timeOffRepository.findApprovedOverlapping(
                    timeOff.getStaffId(), timeOff.getStartDate(), timeOff.getEndDate());
            if (!overlapping.isEmpty()) {
                throw new IllegalArgumentException("Cannot approve: conflicts with existing approved time off");
            }
        }

        timeOff.setStatus(newStatus);
        timeOff.setApprovedBy(approverId);

        return timeOffRepository.save(timeOff);
    }

    @Transactional(readOnly = true)
    public List<StaffSchedule> getStaffSchedule(UUID staffId, LocalDate startDate, LocalDate endDate) {
        Instant start = startDate.atStartOfDay(ZoneId.of("Asia/Jakarta")).toInstant();
        Instant end = endDate.plusDays(1).atStartOfDay(ZoneId.of("Asia/Jakarta")).toInstant();

        List<StaffSchedule> schedules = staffScheduleRepository.findByStaffId(staffId);

        return schedules.stream()
                .filter(s -> !s.getEffectiveFrom().isAfter(end))
                .filter(s -> s.getEffectiveUntil() == null || !s.getEffectiveUntil().isBefore(start))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StaffSchedule> getActiveSchedule(UUID staffId, Instant date) {
        return staffScheduleRepository.findByStaffIdAndEffectiveFromLessThanEqualAndEffectiveUntilGreaterThanEqual(
                staffId, date, date);
    }

    @Transactional(readOnly = true)
    public List<Staff> getActivePublicStaff(UUID tenantId) {
        return staffRepository.findActivePublicStaff(tenantId);
    }

    @Transactional(readOnly = true)
    public List<Staff> getStaffByTenant(UUID tenantId) {
        return staffRepository.findByTenantIdAndIsActiveTrue(tenantId);
    }

    @Transactional(readOnly = true)
    public Staff getStaffById(UUID staffId) {
        return staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found: " + staffId));
    }

    @Transactional
    public StaffSchedule addSchedule(UUID staffId, StaffSchedule schedule) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found: " + staffId));

        if (!Boolean.TRUE.equals(staff.getIsActive())) {
            throw new IllegalStateException("Only active staff can have schedules");
        }

        schedule.setStaffId(staffId);
        return staffScheduleRepository.save(schedule);
    }

    @Transactional
    public void removeSchedule(UUID scheduleId) {
        StaffSchedule schedule = staffScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found: " + scheduleId));
        staffScheduleRepository.delete(schedule);
    }
}
