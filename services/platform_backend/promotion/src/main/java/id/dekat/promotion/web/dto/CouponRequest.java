package id.dekat.promotion.web.dto;

public record CouponRequest(String code, String discountType, Integer discountValue,
    Integer maxUses, Integer minOrder, String startsAt, String expiresAt) {}
