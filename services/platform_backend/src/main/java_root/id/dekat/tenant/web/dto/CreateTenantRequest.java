package id.dekat.tenant.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

public class CreateTenantRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Slug is required")
    private String slug;

    private String legalName;

    private String taxId;

    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    public CreateTenantRequest() {}

    public CreateTenantRequest(String name, String slug, String legalName, String taxId, String phone, String email) {
        this.name = name;
        this.slug = slug;
        this.legalName = legalName;
        this.taxId = taxId;
        this.phone = phone;
        this.email = email;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getLegalName() { return legalName; }
    public void setLegalName(String legalName) { this.legalName = legalName; }

    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
