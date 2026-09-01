package id.dekat.reporting.application;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReportingService Unit Tests")
class ReportingServiceTest {

    @Mock private EntityManager em;
    @Mock private Query query;

    private ReportingService reportingService;

    private UUID tenantId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        reportingService = new ReportingService();
        // inject EntityManager via reflection
        try {
            var field = ReportingService.class.getDeclaredField("em");
            field.setAccessible(true);
            field.set(reportingService, em);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    @DisplayName("getAnalytics should return all keys")
    void getAnalytics_returnsAllKeys() {
        // general stub for any native query
        lenient().when(em.createNativeQuery(anyString())).thenReturn(query);
        lenient().when(query.setParameter(anyString(), any())).thenReturn(query);
        lenient().when(query.getResultList()).thenReturn(Collections.emptyList());
        lenient().when(query.getSingleResult()).thenReturn(0L);

        LocalDate start = LocalDate.now().minusDays(7);
        LocalDate end = LocalDate.now();
        Map<String, Object> result = reportingService.getAnalytics(tenantId, start, end, "day");

        assertThat(result).containsKeys("revenueByDay", "bookingsByStatus", "retention", "funnel", "topServices", "staffUtilization");
        assertThat(result.get("revenueByDay")).isInstanceOf(List.class);
        assertThat(result.get("bookingsByStatus")).isInstanceOf(Map.class);
    }

    @Test
    @DisplayName("exportCsv should contain headers")
    void exportCsv_containsHeaders() {
        lenient().when(em.createNativeQuery(anyString())).thenReturn(query);
        lenient().when(query.setParameter(anyString(), any())).thenReturn(query);
        lenient().when(query.getResultList()).thenReturn(Collections.emptyList());
        lenient().when(query.getSingleResult()).thenReturn(0L);

        LocalDate start = LocalDate.now().minusDays(7);
        LocalDate end = LocalDate.now();
        String csv = reportingService.exportCsv(tenantId, start, end);

        assertThat(csv).contains("DEKAT Analytics Export");
        assertThat(csv).contains("Revenue By Day");
        assertThat(csv).contains("Bookings By Status");
        assertThat(csv).contains("Top Services");
    }

    @Test
    @DisplayName("bookingsByStatus should return map with all statuses")
    void bookingsByStatus_returnsAllStatuses() {
        lenient().when(em.createNativeQuery(anyString())).thenReturn(query);
        lenient().when(query.setParameter(anyString(), any())).thenReturn(query);
        lenient().when(query.getResultList()).thenReturn(List.of(new Object[]{"CONFIRMED", 5L}, new Object[]{"CANCELLED", 2L}));

        var start = LocalDate.now().minusDays(7).atStartOfDay(java.time.ZoneId.of("Asia/Jakarta")).toOffsetDateTime();
        var end = LocalDate.now().atStartOfDay(java.time.ZoneId.of("Asia/Jakarta")).toOffsetDateTime();
        Map<String, Long> map = reportingService.bookingsByStatus(tenantId, start, end);

        assertThat(map).containsEntry("CONFIRMED", 5L);
        assertThat(map).containsEntry("CANCELLED", 2L);
        // other statuses default 0
        assertThat(map).containsKey("COMPLETED");
    }

    @Test
    @DisplayName("retention should calculate rate")
    void retention_calculatesRate() {
        List<Object[]> rows = List.of(new Object[]{UUID.randomUUID(), 2L}, new Object[]{UUID.randomUUID(), 1L}, new Object[]{UUID.randomUUID(), 3L});
        lenient().when(em.createNativeQuery(anyString())).thenReturn(query);
        lenient().when(query.setParameter(anyString(), any())).thenReturn(query);
        lenient().when(query.getResultList()).thenReturn(rows);

        var start = LocalDate.now().minusDays(30).atStartOfDay(java.time.ZoneId.of("Asia/Jakarta")).toOffsetDateTime();
        var end = LocalDate.now().atStartOfDay(java.time.ZoneId.of("Asia/Jakarta")).toOffsetDateTime();
        Map<String, Object> ret = reportingService.retention(tenantId, start, end);

        assertThat(ret.get("totalCustomers")).isEqualTo(3L);
        assertThat(ret.get("returningCustomers")).isEqualTo(2L);
        assertThat((Double) ret.get("retentionRate")).isBetween(0.6, 0.7);
    }
}
