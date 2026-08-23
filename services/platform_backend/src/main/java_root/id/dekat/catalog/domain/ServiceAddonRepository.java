package id.dekat.catalog.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceAddonRepository extends JpaRepository<ServiceAddon, UUID> {

    List<ServiceAddon> findByServiceId(UUID serviceId);
}
