package id.dekat.promotion.application;

import id.dekat.promotion.domain.LoyaltyEntry;
import id.dekat.promotion.domain.LoyaltyEntryRepository;
import id.dekat.promotion.domain.LoyaltyEntryType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoyaltyService {

    private final LoyaltyEntryRepository loyaltyEntryRepository;

    @Transactional
    public LoyaltyEntry earnPoints(UUID tenantId, UUID customerId, UUID bookingId, int points) {
        int currentBalance = getBalance(tenantId, customerId);
        int newBalance = currentBalance + points;

        LoyaltyEntry entry = LoyaltyEntry.builder()
                .tenantId(tenantId)
                .customerId(customerId)
                .bookingId(bookingId)
                .entryType(LoyaltyEntryType.EARN)
                .points(points)
                .balanceAfter(newBalance)
                .build();

        return loyaltyEntryRepository.save(entry);
    }

    @Transactional
    public LoyaltyEntry redeemPoints(UUID tenantId, UUID customerId, UUID bookingId, int points) {
        int currentBalance = getBalance(tenantId, customerId);
        if (currentBalance < points) {
            throw new IllegalStateException("Insufficient loyalty points. Available: " + currentBalance);
        }

        int newBalance = currentBalance - points;

        LoyaltyEntry entry = LoyaltyEntry.builder()
                .tenantId(tenantId)
                .customerId(customerId)
                .bookingId(bookingId)
                .entryType(LoyaltyEntryType.REDEEM)
                .points(-points)
                .balanceAfter(newBalance)
                .build();

        return loyaltyEntryRepository.save(entry);
    }

    @Transactional(readOnly = true)
    public int getBalance(UUID tenantId, UUID customerId) {
        return loyaltyEntryRepository.sumPoints(tenantId, customerId);
    }

    @Transactional(readOnly = true)
    public List<LoyaltyEntry> getHistory(UUID tenantId, UUID customerId) {
        return loyaltyEntryRepository.findByTenantIdAndCustomerIdOrderByCreatedAtDesc(tenantId, customerId);
    }
}
