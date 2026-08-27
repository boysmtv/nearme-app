package id.dekat.promotion.web;

import id.dekat.promotion.application.CampaignService;
import id.dekat.promotion.domain.Campaign;
import id.dekat.promotion.domain.CampaignType;
import id.dekat.promotion.web.dto.CampaignRequest;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/provider/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Campaign>>> getCampaigns(
            @RequestHeader("X-Tenant-Id") UUID tenantId) {
        List<Campaign> campaigns = campaignService.getCampaignsByTenant(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(campaigns));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Campaign>> createCampaign(
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @RequestBody CampaignRequest request) {
        CampaignType type = CampaignType.valueOf(request.campaignType());
        OffsetDateTime startsAt = request.startsAt() != null ? OffsetDateTime.parse(request.startsAt()) : null;
        OffsetDateTime endsAt = request.endsAt() != null ? OffsetDateTime.parse(request.endsAt()) : null;

        Campaign campaign = campaignService.createCampaign(
                tenantId, request.name(), type, request.config(), startsAt, endsAt);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(campaign));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Campaign>> activateCampaign(@PathVariable UUID id) {
        Campaign campaign = campaignService.activateCampaign(id);
        return ResponseEntity.ok(ApiResponse.ok(campaign));
    }

    @PutMapping("/{id}/pause")
    public ResponseEntity<ApiResponse<Campaign>> pauseCampaign(@PathVariable UUID id) {
        Campaign campaign = campaignService.pauseCampaign(id);
        return ResponseEntity.ok(ApiResponse.ok(campaign));
    }
}
