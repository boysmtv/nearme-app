package id.dekat.customer.application;

import id.dekat.customer.domain.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerProfileRepository customerProfileRepository;

    @Transactional(readOnly = true)
    public CustomerProfile getProfile(UUID userId, UUID tenantId) {
        return customerProfileRepository.findByUserIdAndTenantId(userId, tenantId)
                .orElse(null);
    }

    @Transactional
    public CustomerProfile createOrUpdateProfile(UUID userId, UUID tenantId, String nickname) {
        CustomerProfile profile = customerProfileRepository.findByUserIdAndTenantId(userId, tenantId)
                .orElse(null);
        if (profile == null) {
            profile = new CustomerProfile();
            profile.setUserId(userId);
            profile.setTenantId(tenantId);
            profile.setNickname(nickname);
            profile.setLoyaltyPoints(0);
            profile.setTotalBookings(0);
            profile.setTotalSpent(BigDecimal.ZERO);
            profile.setCreatedAt(OffsetDateTime.now());
        } else if (nickname != null) {
            profile.setNickname(nickname);
        }
        profile.setUpdatedAt(OffsetDateTime.now());
        return customerProfileRepository.save(profile);
    }

    @Transactional
    public void incrementBookingStats(UUID userId, UUID tenantId, BigDecimal amount) {
        CustomerProfile profile = customerProfileRepository.findByUserIdAndTenantId(userId, tenantId)
                .orElse(null);
        if (profile != null) {
            profile.setTotalBookings(profile.getTotalBookings() + 1);
            profile.setTotalSpent(profile.getTotalSpent().add(amount));
            profile.setLastBookingAt(OffsetDateTime.now());
            profile.setUpdatedAt(OffsetDateTime.now());
            customerProfileRepository.save(profile);
        }
    }

    @Transactional(readOnly = true)
    public List<CustomerProfile> getCustomersByTenant(UUID tenantId) {
        return customerProfileRepository.findByTenantId(tenantId);
    }
}
