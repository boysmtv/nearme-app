package id.dekat.subscription.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlanRepository extends JpaRepository<Plan, UUID> {

    Optional<Plan> findBySlug(String slug);

    Optional<Plan> findByIdAndStatus(UUID id, Plan.PlanStatus status);
}
