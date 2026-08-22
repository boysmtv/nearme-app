package id.dekat.scheduling.application;

import id.dekat.scheduling.domain.AvailabilityRule;
import id.dekat.scheduling.domain.AvailabilitySlot;
import id.dekat.scheduling.domain.SchedulingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.*;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AvailabilityService")
class AvailabilityServiceTest {

    @Mock
    private SchedulingRepository schedulingRepository;

    @InjectMocks
    private AvailabilityService availabilityService;

    private UUID tenantId;
    private UUID staffId;
    private UUID resourceId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        staffId = UUID.randomUUID();
        resourceId = UUID.randomUUID();
    }

    @Nested
    @DisplayName("getAvailableSlots")
    class GetAvailableSlotsTests {

        @Test
        @DisplayName("should generate 30-min slots from availability rules")
        void testGetAvailableSlots_Success() {
            LocalDate date = LocalDate.now().plusDays(1);
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            Instant dayStart = date.atStartOfDay(ZoneId.of("Asia/Jakarta")).toInstant();

            AvailabilityRule rule = AvailabilityRule.builder()
                    .id(UUID.randomUUID())
                    .tenantId(tenantId)
                    .staffId(staffId)
                    .resourceId(resourceId)
                    .dayOfWeek(dayOfWeek)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(12, 0))
                    .effectiveFrom(Instant.now().minus(Duration.ofDays(30)))
                    .build();

            when(schedulingRepository.findActiveRules(
                    eq(tenantId), eq(staffId), eq(dayOfWeek), eq(dayStart)))
                    .thenReturn(List.of(rule));

            List<AvailabilitySlot> slots = availabilityService.getAvailableSlots(
                    tenantId, staffId, resourceId, date);

            assertThat(slots).hasSize(6);
            assertThat(slots).allMatch(AvailabilitySlot::isAvailable);
        }

        @Test
        @DisplayName("should return empty when no rules exist")
        void testGetAvailableSlots_NoRules() {
            LocalDate date = LocalDate.now().plusDays(1);
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            Instant dayStart = date.atStartOfDay(ZoneId.of("Asia/Jakarta")).toInstant();

            when(schedulingRepository.findActiveRules(
                    eq(tenantId), eq(staffId), eq(dayOfWeek), eq(dayStart)))
                    .thenReturn(Collections.emptyList());

            List<AvailabilitySlot> slots = availabilityService.getAvailableSlots(
                    tenantId, staffId, resourceId, date);

            assertThat(slots).isEmpty();
        }
    }

    @Nested
    @DisplayName("validateSlot")
    class ValidateSlotTests {

        @Test
        @DisplayName("should return true when slot is within rule coverage")
        void testValidateSlot_Valid() {
            LocalDate date = LocalDate.now().plusDays(1);
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            Instant startsAt = date.atTime(10, 0).atZone(ZoneId.of("Asia/Jakarta")).toInstant();
            Instant endsAt = date.atTime(11, 0).atZone(ZoneId.of("Asia/Jakarta")).toInstant();

            AvailabilityRule rule = AvailabilityRule.builder()
                    .id(UUID.randomUUID())
                    .tenantId(tenantId)
                    .staffId(staffId)
                    .dayOfWeek(dayOfWeek)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(17, 0))
                    .effectiveFrom(Instant.now().minus(Duration.ofDays(30)))
                    .build();

            when(schedulingRepository.findActiveRules(
                    eq(tenantId), eq(staffId), eq(dayOfWeek), any(Instant.class)))
                    .thenReturn(List.of(rule));

            boolean valid = availabilityService.validateSlot(tenantId, staffId, startsAt, endsAt);

            assertThat(valid).isTrue();
        }

        @Test
        @DisplayName("should return false for null times")
        void testValidateSlot_NullTimes() {
            boolean valid = availabilityService.validateSlot(tenantId, staffId, null, null);

            assertThat(valid).isFalse();
        }

        @Test
        @DisplayName("should return false when start is after end")
        void testValidateSlot_InvalidRange() {
            LocalDate date = LocalDate.now().plusDays(1);
            Instant startsAt = date.atTime(11, 0).atZone(ZoneId.of("Asia/Jakarta")).toInstant();
            Instant endsAt = date.atTime(10, 0).atZone(ZoneId.of("Asia/Jakarta")).toInstant();

            boolean valid = availabilityService.validateSlot(tenantId, staffId, startsAt, endsAt);

            assertThat(valid).isFalse();
        }
    }

    @Nested
    @DisplayName("checkOverlap")
    class CheckOverlapTests {

        @Test
        @DisplayName("should return true when slot overlaps with rule")
        void testCheckOverlap_True() {
            LocalDate date = LocalDate.now().plusDays(1);
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            Instant startsAt = date.atTime(10, 0).atZone(ZoneId.of("Asia/Jakarta")).toInstant();
            Instant endsAt = date.atTime(11, 0).atZone(ZoneId.of("Asia/Jakarta")).toInstant();

            AvailabilityRule rule = AvailabilityRule.builder()
                    .id(UUID.randomUUID())
                    .tenantId(tenantId)
                    .staffId(staffId)
                    .dayOfWeek(dayOfWeek)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(17, 0))
                    .effectiveFrom(Instant.now().minus(Duration.ofDays(30)))
                    .build();

            when(schedulingRepository.findActiveRules(
                    eq(tenantId), eq(staffId), eq(dayOfWeek), any(Instant.class)))
                    .thenReturn(List.of(rule));

            boolean overlap = availabilityService.checkOverlap(tenantId, staffId, startsAt, endsAt);

            assertThat(overlap).isTrue();
        }

        @Test
        @DisplayName("should return false when no overlap")
        void testCheckOverlap_False() {
            LocalDate date = LocalDate.now().plusDays(1);
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            Instant startsAt = date.atTime(6, 0).atZone(ZoneId.of("Asia/Jakarta")).toInstant();
            Instant endsAt = date.atTime(7, 0).atZone(ZoneId.of("Asia/Jakarta")).toInstant();

            AvailabilityRule rule = AvailabilityRule.builder()
                    .id(UUID.randomUUID())
                    .tenantId(tenantId)
                    .staffId(staffId)
                    .dayOfWeek(dayOfWeek)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(17, 0))
                    .effectiveFrom(Instant.now().minus(Duration.ofDays(30)))
                    .build();

            when(schedulingRepository.findActiveRules(
                    eq(tenantId), eq(staffId), eq(dayOfWeek), any(Instant.class)))
                    .thenReturn(List.of(rule));

            boolean overlap = availabilityService.checkOverlap(tenantId, staffId, startsAt, endsAt);

            assertThat(overlap).isFalse();
        }
    }

    @Nested
    @DisplayName("getAvailableStaff")
    class GetAvailableStaffTests {

        @Test
        @DisplayName("should return staff with availability rules for date")
        void testGetAvailableStaff_Success() {
            LocalDate date = LocalDate.now().plusDays(1);
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            Instant dayStart = date.atStartOfDay(ZoneId.of("Asia/Jakarta")).toInstant();
            Instant dayEnd = date.plusDays(1).atStartOfDay(ZoneId.of("Asia/Jakarta")).toInstant();

            AvailabilityRule rule = AvailabilityRule.builder()
                    .id(UUID.randomUUID())
                    .tenantId(tenantId)
                    .staffId(staffId)
                    .resourceId(resourceId)
                    .dayOfWeek(dayOfWeek)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(17, 0))
                    .effectiveFrom(dayStart)
                    .effectiveUntil(dayEnd)
                    .build();

            when(schedulingRepository.findByTenantIdAndDayOfWeekAndEffectiveFromLessThanEqualAndEffectiveUntilGreaterThanEqual(
                    eq(tenantId), eq(dayOfWeek), eq(dayStart), eq(dayEnd)))
                    .thenReturn(List.of(rule));

            List<AvailabilitySlot> result = availabilityService.getAvailableStaff(
                    tenantId, resourceId, date);

            assertThat(result).isNotEmpty();
            assertThat(result.get(0).getStaffId()).isEqualTo(staffId);
        }
    }
}