package id.dekat.support.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CaseEventRepository extends JpaRepository<CaseEvent, UUID> {

    List<CaseEvent> findByCaseIdOrderByCreatedAtAsc(UUID caseId);
}
