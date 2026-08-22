package id.dekat.booking.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingAssignmentRepository extends JpaRepository<BookingAssignment, UUID> {

    List<BookingAssignment> findByBookingId(UUID bookingId);

    List<BookingAssignment> findByStaffIdAndStatus(UUID staffId, BookingAssignment.AssignmentStatus status);
}
