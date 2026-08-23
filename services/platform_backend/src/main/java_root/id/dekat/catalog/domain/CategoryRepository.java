package id.dekat.catalog.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<ServiceCategory, UUID> {

    List<ServiceCategory> findByParentId(UUID parentId);

    Optional<ServiceCategory> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<ServiceCategory> findByStatus(String status);
}
