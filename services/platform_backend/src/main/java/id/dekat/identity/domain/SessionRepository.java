package id.dekat.identity.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {

    List<Session> findByUserId(UUID userId);

    List<Session> findByUserIdAndRevokedAtIsNull(UUID userId);

    void deleteByUserId(UUID userId);
}
