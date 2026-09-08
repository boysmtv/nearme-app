package id.dekat.customer.application;

import id.dekat.customer.domain.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoyaltyService {

    private final LoyaltyAccountRepository accountRepository;
    private final LoyaltyTransactionRepository transactionRepository;

    @Transactional
    public LoyaltyAccount getOrCreateAccount(UUID customerId, UUID tenantId) {
        return accountRepository.findByCustomerIdAndTenantId(customerId, tenantId)
                .orElseGet(() -> {
                    LoyaltyAccount account = new LoyaltyAccount();
                    account.setCustomerId(customerId);
                    account.setTenantId(tenantId);
                    account.setPoints(0);
                    account.setTier("BRONZE");
                    return accountRepository.save(account);
                });
    }

    @Transactional
    public void earnPoints(UUID customerId, UUID tenantId, UUID bookingId, int points, String description) {
        LoyaltyAccount account = getOrCreateAccount(customerId, tenantId);
        account.addPoints(points);
        accountRepository.save(account);

        LoyaltyTransaction tx = new LoyaltyTransaction();
        tx.setAccountId(account.getId());
        tx.setCustomerId(customerId);
        tx.setTenantId(tenantId);
        tx.setType("EARN");
        tx.setPoints(points);
        tx.setBookingId(bookingId);
        tx.setDescription(description);
        transactionRepository.save(tx);

        log.info("[Loyalty] Customer {} earned {} points (total: {}, tier: {})",
                customerId, points, account.getPoints(), account.getTier());
    }

    @Transactional
    public boolean redeemPoints(UUID customerId, UUID tenantId, int points, String description) {
        LoyaltyAccount account = getOrCreateAccount(customerId, tenantId);
        if (!account.redeemPoints(points)) {
            return false;
        }
        accountRepository.save(account);

        LoyaltyTransaction tx = new LoyaltyTransaction();
        tx.setAccountId(account.getId());
        tx.setCustomerId(customerId);
        tx.setTenantId(tenantId);
        tx.setType("REDEEM");
        tx.setPoints(-points);
        tx.setDescription(description);
        transactionRepository.save(tx);

        log.info("[Loyalty] Customer {} redeemed {} points (remaining: {}, tier: {})",
                customerId, points, account.getPoints(), account.getTier());
        return true;
    }

    @Transactional
    public void birthdayBonus(UUID customerId, UUID tenantId) {
        LoyaltyAccount account = getOrCreateAccount(customerId, tenantId);
        int bonus = 500;
        account.addPoints(bonus);
        accountRepository.save(account);

        LoyaltyTransaction tx = new LoyaltyTransaction();
        tx.setAccountId(account.getId());
        tx.setCustomerId(customerId);
        tx.setTenantId(tenantId);
        tx.setType("BONUS");
        tx.setPoints(bonus);
        tx.setDescription("Birthday Bonus");
        transactionRepository.save(tx);

        log.info("[Loyalty] Customer {} received {} birthday bonus points", customerId, bonus);
    }

    public Map<String, Object> getAccountInfo(UUID customerId, UUID tenantId) {
        LoyaltyAccount account = getOrCreateAccount(customerId, tenantId);
        List<LoyaltyTransaction> transactions = transactionRepository.findByAccountIdOrderByCreatedAtDesc(account.getId());

        Map<String, Object> info = new LinkedHashMap<>();
        info.put("points", account.getPoints());
        info.put("totalEarned", account.getTotalEarned());
        info.put("totalRedeemed", account.getTotalRedeemed());
        info.put("tier", account.getTier());
        info.put("transactions", transactions.stream().map(tx -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", tx.getId().toString());
            map.put("type", tx.getType());
            map.put("points", tx.getPoints());
            map.put("description", tx.getDescription());
            map.put("createdAt", tx.getCreatedAt().toString());
            return map;
        }).toList());

        return info;
    }
}
