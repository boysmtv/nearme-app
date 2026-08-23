package id.dekat.booking.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "booking_assignments")
public class BookingAssignment {

    public enum AssignmentStatus {
        ASSIGNED, CONFIRMED, DECLINED, COMPLETED, CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID bookingId;

    @Column(nullable = false)
    private UUID staffId;

    private UUID resourceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssignmentStatus status;

    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;

    protected BookingAssignment() {}

    public BookingAssignment(UUID bookingId, UUID staffId, UUID resourceId,
                             OffsetDateTime startsAt, OffsetDateTime endsAt) {
        this.bookingId = bookingId;
        this.staffId = staffId;
        this.resourceId = resourceId;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.status = AssignmentStatus.ASSIGNED;
    }

    public void confirm() { this.status = AssignmentStatus.CONFIRMED; }
    public void decline() { this.status = AssignmentStatus.DECLINED; }
    public void complete() { this.status = AssignmentStatus.COMPLETED; }
    public void cancel() { this.status = AssignmentStatus.CANCELLED; }

    public UUID getId() { return id; }
    public UUID getBookingId() { return bookingId; }
    public UUID getStaffId() { return staffId; }
    public UUID getResourceId() { return resourceId; }
    public AssignmentStatus getStatus() { return status; }
    public OffsetDateTime getStartsAt() { return startsAt; }
    public OffsetDateTime getEndsAt() { return endsAt; }
}
