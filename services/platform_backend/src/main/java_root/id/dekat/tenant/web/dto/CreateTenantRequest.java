package id.dekat.tenant.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

public class CreateTenantRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Slug is required")
    private String slug;

    @NotBlank(message = "Category is required")
    private String category;

    @Email(message = "Invalid email format")
    private String contactEmail;

    private String contactPhone;

    public CreateTenantRequest() {}

    public CreateTenantRequest(String name, String slug, String category, String contactEmail, String contactPhone) {
        this.name = name;
        this.slug = slug;
        this.category = category;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
}
