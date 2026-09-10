package id.dekat.customer.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SocialLikeRepository extends JpaRepository<SocialLike, UUID> {
    Optional<SocialLike> findByPostIdAndCustomerId(UUID postId, UUID customerId);
    boolean existsByPostIdAndCustomerId(UUID postId, UUID customerId);
    long countByPostId(UUID postId);
}
