package id.dekat.staff.web;

import id.dekat.staff.application.StaffService;
import id.dekat.staff.domain.Staff;
import id.dekat.staff.domain.StaffSchedule;
import id.dekat.sharedkernel.web.ApiResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/provider/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @PersistenceContext
    private EntityManager entityManager;

    @PostMapping
    public ResponseEntity<ApiResponse<Staff>> inviteStaff(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestBody InviteStaffRequest request) {
        UUID tid = resolveTenant(tenantId);
        Staff staff = staffService.inviteStaff(tid, request.displayName(), request.email(), null);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(staff));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Staff>>> getStaff(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId) {
        List<Staff> staffList = staffService.getActivePublicStaff(resolveTenant(tenantId));
        return ResponseEntity.ok(ApiResponse.ok(staffList));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Staff>> updateStaff(
            @PathVariable UUID id,
            @RequestBody Staff staff) {
        Staff updated = staffService.updateStaff(id, staff);
        return ResponseEntity.ok(ApiResponse.ok(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateStaff(@PathVariable UUID id) {
        staffService.deactivateStaff(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<ApiResponse<StaffSchedule>> addSchedule(
            @PathVariable UUID id,
            @RequestBody StaffSchedule schedule) {
        StaffSchedule saved = staffService.addSchedule(id, schedule);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(saved));
    }

    private UUID resolveTenant(UUID tenantId) {
        if (tenantId != null) {
            return tenantId;
        }
        Object result = entityManager
                .createNativeQuery("SELECT id FROM tenants ORDER BY created_at LIMIT 1")
                .getSingleResult();
        return (UUID) result;
    }

    public record InviteStaffRequest(String displayName, String email) {}
}
