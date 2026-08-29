package id.dekat.booking.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DisplayName("BookingAssignment Domain Entity Tests")
class BookingAssignmentTest {

    @Test
    @DisplayName("constructor - should create assignment with ASSIGNED status")
    void constructor_createsAssignmentWithAssignedStatus() {
        UUID bookingId = UUID.randomUUID();
        UUID staffId = UUID.randomUUID();
        OffsetDateTime startsAt = OffsetDateTime.now().plusHours(1);
        OffsetDateTime endsAt = startsAt.plusHours(1);

        BookingAssignment assignment = new BookingAssignment(
                bookingId, staffId, startsAt, endsAt);

        assertThat(assignment.getBookingId()).isEqualTo(bookingId);
        assertThat(assignment.getStaffId()).isEqualTo(staffId);
        assertThat(assignment.getStartsAt()).isEqualTo(startsAt);
        assertThat(assignment.getEndsAt()).isEqualTo(endsAt);
        assertThat(assignment.getStatus()).isEqualTo(BookingAssignment.AssignmentStatus.ASSIGNED);
    }

    @Test
    @DisplayName("accept - should transition to ACCEPTED")
    void confirm_transitionsToConfirmed() {
        BookingAssignment assignment = createDefaultAssignment();

        assignment.accept();

        assertThat(assignment.getStatus()).isEqualTo(BookingAssignment.AssignmentStatus.ACCEPTED);
    }

    @Test
    @DisplayName("decline - should transition to DECLINED")
    void decline_transitionsToDeclined() {
        BookingAssignment assignment = createDefaultAssignment();

        assignment.decline();

        assertThat(assignment.getStatus()).isEqualTo(BookingAssignment.AssignmentStatus.DECLINED);
    }

    @Test
    @DisplayName("complete - should transition to COMPLETED")
    void complete_transitionsToCompleted() {
        BookingAssignment assignment = createDefaultAssignment();
        assignment.accept();

        assignment.complete();

        assertThat(assignment.getStatus()).isEqualTo(BookingAssignment.AssignmentStatus.COMPLETED);
    }

    @Test
    @DisplayName("decline via cancel path - should transition to DECLINED")
    void cancel_transitionsToCancelled() {
        BookingAssignment assignment = createDefaultAssignment();

        assignment.decline();

        assertThat(assignment.getStatus()).isEqualTo(BookingAssignment.AssignmentStatus.DECLINED);
    }

    private BookingAssignment createDefaultAssignment() {
        return new BookingAssignment(
                UUID.randomUUID(), UUID.randomUUID(),
                OffsetDateTime.now().plusHours(1),
                OffsetDateTime.now().plusHours(2));
    }
}
