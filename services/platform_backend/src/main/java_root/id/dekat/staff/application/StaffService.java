package id.dekat.staff.application;

import id.dekat.staff.domain.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
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
    public Staff updateStaff(UUID staffId, Staff update) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found: " + staffId));

        if (update.getDisplayName() != null) staff.setDisplayName(update.getDisplayName());
        if (update.getTitle() != null) staff.setTitle(update.getTitle());
        if (update.getBio() != null) staff.setBio(update.getBio());
        if (update.getAvatarUrl() != null) staff.setAvatarUrl(update.getAvatarUrl());
        if (update.getSortOrder() != null) staff.setSortOrder(update.getSortOrder());
        if (update.getIsActive() != null) staff.setIsActive(update.getIsActive());

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
        // StaffSchedule now uses dayOfWeek-based weekly recurring schedules,
        // not date-ranged effective periods. Filter by day of week for the given range.
        List<StaffSchedule> schedules = staffScheduleRepository.findByStaffId(staffId);

        return schedules.stream()
                .filter(StaffSchedule::getIsActive)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StaffSchedule> getActiveSchedule(UUID staffId, Instant date) {
        // StaffSchedule no longer has effectiveFrom/effectiveUntil fields.
        // Return all active schedules for this staff member.
        return staffScheduleRepository.findByStaffId(staffId).stream()
                .filter(StaffSchedule::getIsActive)
                .toList();
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
