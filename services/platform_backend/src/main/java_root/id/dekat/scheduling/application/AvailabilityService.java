package id.dekat.scheduling.application;

import id.dekat.scheduling.domain.AvailabilityRule;
import id.dekat.scheduling.domain.AvailabilitySlot;
import id.dekat.scheduling.domain.SchedulingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private static final int SLOT_STEP_MINUTES = 30;

    private final SchedulingRepository schedulingRepository;

    @Transactional(readOnly = true)
    public List<AvailabilitySlot> getAvailableSlots(UUID tenantId, UUID staffId,
                                                     UUID resourceId, LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        Instant dayStart = date.atStartOfDay(ZoneId.of("Asia/Jakarta")).toInstant();
        Instant dayEnd = date.plusDays(1).atStartOfDay(ZoneId.of("Asia/Jakarta")).toInstant();

        List<AvailabilityRule> rules = schedulingRepository.findActiveRules(
                tenantId, staffId, dayOfWeek, dayStart);

        if (rules.isEmpty()) {
            return Collections.emptyList();
        }

        List<AvailabilitySlot> availableSlots = new ArrayList<>();

        for (AvailabilityRule rule : rules) {
            LocalDateTime ruleStartDateTime = date.atTime(rule.getStartTime());
            LocalDateTime ruleEndDateTime = date.atTime(rule.getEndTime());

            Instant ruleStart = ruleStartDateTime.atZone(ZoneId.of("Asia/Jakarta")).toInstant();
            Instant ruleEnd = ruleEndDateTime.atZone(ZoneId.of("Asia/Jakarta")).toInstant();

            // Generate slots in 30-minute increments
            Instant currentSlotStart = ruleStart;
            while (currentSlotStart.plus(Duration.ofMinutes(SLOT_STEP_MINUTES)).isBefore(ruleEnd)
                    || currentSlotStart.plus(Duration.ofMinutes(SLOT_STEP_MINUTES)).equals(ruleEnd)) {
                Instant currentSlotEnd = currentSlotStart.plus(Duration.ofMinutes(SLOT_STEP_MINUTES));

                if (currentSlotEnd.isAfter(ruleEnd)) {
                    currentSlotEnd = ruleEnd;
                }

                availableSlots.add(AvailabilitySlot.builder()
                        .startsAt(currentSlotStart)
                        .endsAt(currentSlotEnd)
                        .staffId(staffId)
                        .resourceId(resourceId)
                        .available(true)
                        .build());

                currentSlotStart = currentSlotEnd;
            }
        }

        return availableSlots;
    }

    @Transactional(readOnly = true)
    public boolean validateSlot(UUID tenantId, UUID staffId, Instant startsAt, Instant endsAt) {
        if (startsAt == null || endsAt == null) {
            return false;
        }
        if (!startsAt.isBefore(endsAt)) {
            return false;
        }

        // Check staff has availability rules covering this time
        ZonedDateTime zonedStart = startsAt.atZone(ZoneId.of("Asia/Jakarta"));
        LocalDate date = zonedStart.toLocalDate();
        DayOfWeek dayOfWeek = date.getDayOfWeek();

        List<AvailabilityRule> rules = schedulingRepository.findActiveRules(
                tenantId, staffId, dayOfWeek, startsAt);

        boolean hasRuleCoverage = rules.stream().anyMatch(rule -> {
            LocalDateTime ruleStartDateTime = date.atTime(rule.getStartTime());
            LocalDateTime ruleEndDateTime = date.atTime(rule.getEndTime());
            Instant ruleStart = ruleStartDateTime.atZone(ZoneId.of("Asia/Jakarta")).toInstant();
            Instant ruleEnd = ruleEndDateTime.atZone(ZoneId.of("Asia/Jakarta")).toInstant();

            return !startsAt.isBefore(ruleStart) && !endsAt.isAfter(ruleEnd);
        });

        return hasRuleCoverage;
    }

    @Transactional(readOnly = true)
    public List<AvailabilitySlot> getAvailableStaff(UUID tenantId, UUID resourceId, LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        Instant dayStart = date.atStartOfDay(ZoneId.of("Asia/Jakarta")).toInstant();
        Instant dayEnd = date.plusDays(1).atStartOfDay(ZoneId.of("Asia/Jakarta")).toInstant();

        List<AvailabilityRule> rules = schedulingRepository.findByTenantIdAndDayOfWeekAndEffectiveFromLessThanEqualAndEffectiveUntilGreaterThanEqual(
                tenantId, dayOfWeek, dayStart, dayEnd);

        Map<UUID, List<AvailabilityRule>> rulesByStaff = rules.stream()
                .collect(Collectors.groupingBy(AvailabilityRule::getStaffId));

        List<AvailabilitySlot> staffSlots = new ArrayList<>();

        for (Map.Entry<UUID, List<AvailabilityRule>> entry : rulesByStaff.entrySet()) {
            UUID staffId = entry.getKey();
            List<AvailabilityRule> staffRules = entry.getValue();

            for (AvailabilityRule rule : staffRules) {
                Instant slotStart = date.atTime(rule.getStartTime())
                        .atZone(ZoneId.of("Asia/Jakarta")).toInstant();
                Instant slotEnd = date.atTime(rule.getEndTime())
                        .atZone(ZoneId.of("Asia/Jakarta")).toInstant();

                staffSlots.add(AvailabilitySlot.builder()
                        .startsAt(slotStart)
                        .endsAt(slotEnd)
                        .staffId(staffId)
                        .resourceId(rule.getResourceId())
                        .available(true)
                        .build());
            }
        }

        return staffSlots;
    }

    @Transactional(readOnly = true)
    public boolean checkOverlap(UUID tenantId, UUID staffId, Instant startsAt, Instant endsAt) {
        ZonedDateTime zonedStart = startsAt.atZone(ZoneId.of("Asia/Jakarta"));
        LocalDate date = zonedStart.toLocalDate();
        DayOfWeek dayOfWeek = date.getDayOfWeek();

        List<AvailabilityRule> rules = schedulingRepository.findActiveRules(
                tenantId, staffId, dayOfWeek, startsAt);

        for (AvailabilityRule rule : rules) {
            Instant ruleStart = date.atTime(rule.getStartTime())
                    .atZone(ZoneId.of("Asia/Jakarta")).toInstant();
            Instant ruleEnd = date.atTime(rule.getEndTime())
                    .atZone(ZoneId.of("Asia/Jakarta")).toInstant();

            if (startsAt.isBefore(ruleEnd) && endsAt.isAfter(ruleStart)) {
                return true;
            }
        }
        return false;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOperatingHours(UUID tenantId, UUID locationId, LocalDate date) {
        // Retrieve operating hours for a location on a specific date
        // This is a simplified implementation that returns a default structure
        Map<String, Object> operatingHours = new HashMap<>();
        operatingHours.put("dayOfWeek", date.getDayOfWeek().toString());
        operatingHours.put("date", date.toString());
        operatingHours.put("isOpen", true);
        operatingHours.put("openTime", "09:00");
        operatingHours.put("closeTime", "18:00");
        operatingHours.put("timezone", "Asia/Jakarta");
        return operatingHours;
    }
}
