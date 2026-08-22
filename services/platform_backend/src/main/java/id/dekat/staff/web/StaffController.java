package id.dekat.staff.web;

import id.dekat.staff.application.StaffService;
import id.dekat.staff.domain.Staff;
import id.dekat.staff.domain.StaffSchedule;
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

    @PostMapping
    public ResponseEntity<Staff> inviteStaff(
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @RequestBody InviteStaffRequest request) {
        Staff staff = staffService.invite(tenantId, request.getDisplayName(), request.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(staff);
    }

    @GetMapping
    public ResponseEntity<List<Staff>> getStaff(
            @RequestHeader("X-Tenant-Id") UUID tenantId) {
        List<Staff> staffList = staffService.getActivePublicStaff(tenantId);
        return ResponseEntity.ok(staffList);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Staff> updateStaff(
            @PathVariable UUID id,
            @RequestBody Staff staff) {
        staff.setId(id);
        Staff updated = staffService.activate(id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateStaff(@PathVariable UUID id) {
        staffService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<StaffSchedule> addSchedule(
            @PathVariable UUID id,
            @RequestBody StaffSchedule schedule) {
        schedule.setStaffId(id);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    public record InviteStaffRequest(String displayName, String email) {}
}
