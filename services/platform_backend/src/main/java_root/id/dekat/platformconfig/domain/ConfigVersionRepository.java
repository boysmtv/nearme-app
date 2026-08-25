package id.dekat.platformconfig.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConfigVersionRepository extends JpaRepository<ConfigVersion, UUID> {

    Optional<ConfigVersion> findTopByConfigKeyOrderByVersionDesc(String configKey);
}
