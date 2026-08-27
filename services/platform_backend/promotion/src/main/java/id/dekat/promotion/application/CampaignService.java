package id.dekat.promotion.application;

import id.dekat.promotion.domain.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;

    @Transactional
    public Campaign createCampaign(UUID tenantId, String name, CampaignType type,
                                    String config, OffsetDateTime startsAt, OffsetDateTime endsAt) {
        Campaign campaign = Campaign.builder()
                .tenantId(tenantId)
                .name(name)
                .campaignType(type)
                .config(config)
                .status(CampaignStatus.DRAFT)
                .startsAt(startsAt)
                .endsAt(endsAt)
                .build();

        return campaignRepository.save(campaign);
    }

    @Transactional
    public Campaign activateCampaign(UUID campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found: " + campaignId));

        if (campaign.getStatus() != CampaignStatus.DRAFT && campaign.getStatus() != CampaignStatus.PAUSED) {
            throw new IllegalStateException("Cannot activate campaign in status: " + campaign.getStatus());
        }

        campaign.setStatus(CampaignStatus.ACTIVE);
        return campaignRepository.save(campaign);
    }

    @Transactional
    public Campaign pauseCampaign(UUID campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found: " + campaignId));

        if (campaign.getStatus() != CampaignStatus.ACTIVE) {
            throw new IllegalStateException("Cannot pause campaign in status: " + campaign.getStatus());
        }

        campaign.setStatus(CampaignStatus.PAUSED);
        return campaignRepository.save(campaign);
    }

    @Transactional
    public Campaign endCampaign(UUID campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found: " + campaignId));

        campaign.setStatus(CampaignStatus.ENDED);
        return campaignRepository.save(campaign);
    }

    @Transactional(readOnly = true)
    public List<Campaign> getCampaignsByTenant(UUID tenantId) {
        return campaignRepository.findByTenantIdAndStatus(tenantId, CampaignStatus.ACTIVE);
    }
}
