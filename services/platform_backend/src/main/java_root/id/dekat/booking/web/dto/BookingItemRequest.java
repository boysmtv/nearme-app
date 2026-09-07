package id.dekat.booking.web.dto;

public class BookingItemRequest {

    private String serviceId;
    private String nameSnapshot;
    private Integer priceSnapshot;
    private Integer durationSnapshot;
    private Integer quantity;
    private String staffId;
    private String resourceId;
    private String startsAt;
    private String endsAt;
    private Integer price;
    private Integer discount;
    private Integer tax;
    private String notes;

    public String getServiceId() { return serviceId; }
    public void setServiceId(String serviceId) { this.serviceId = serviceId; }
    public String getNameSnapshot() { return nameSnapshot; }
    public void setNameSnapshot(String nameSnapshot) { this.nameSnapshot = nameSnapshot; }
    public Integer getPriceSnapshot() { return priceSnapshot; }
    public void setPriceSnapshot(Integer priceSnapshot) { this.priceSnapshot = priceSnapshot; }
    public Integer getDurationSnapshot() { return durationSnapshot; }
    public void setDurationSnapshot(Integer durationSnapshot) { this.durationSnapshot = durationSnapshot; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getStaffId() { return staffId; }
    public void setStaffId(String staffId) { this.staffId = staffId; }
    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }
    public String getStartsAt() { return startsAt; }
    public void setStartsAt(String startsAt) { this.startsAt = startsAt; }
    public String getEndsAt() { return endsAt; }
    public void setEndsAt(String endsAt) { this.endsAt = endsAt; }
    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }
    public Integer getDiscount() { return discount; }
    public void setDiscount(Integer discount) { this.discount = discount; }
    public Integer getTax() { return tax; }
    public void setTax(Integer tax) { this.tax = tax; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
