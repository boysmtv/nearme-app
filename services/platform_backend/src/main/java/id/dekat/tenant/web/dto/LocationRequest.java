package id.dekat.tenant.web.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;

public class LocationRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    private Double latitude;

    private Double longitude;

    private String timezone;

    private String phone;

    private List<String> serviceModes;

    private Map<String, Object> operatingHours;

    public LocationRequest() {}

    public LocationRequest(String name, String address, Double latitude, Double longitude, String timezone) {
        this.name = name;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timezone = timezone;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public List<String> getServiceModes() { return serviceModes; }
    public void setServiceModes(List<String> serviceModes) { this.serviceModes = serviceModes; }

    public Map<String, Object> getOperatingHours() { return operatingHours; }
    public void setOperatingHours(Map<String, Object> operatingHours) { this.operatingHours = operatingHours; }
}
