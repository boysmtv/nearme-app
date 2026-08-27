package id.dekat.promotion.web.dto;

public record CampaignRequest(String name, String campaignType, String config,
    String startsAt, String endsAt) {}
