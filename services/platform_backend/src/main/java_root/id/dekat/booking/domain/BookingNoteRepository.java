package id.dekat.booking.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingNoteRepository extends JpaRepository<BookingNote, UUID> {
    List<BookingNote> findByBookingIdOrderByCreatedAtDesc(UUID bookingId);
    List<BookingNote> findByBookingIdAndVisibility(UUID bookingId, BookingNote.NoteVisibility visibility);
}
