package id.dekat.tenant.application;

import id.dekat.tenant.domain.*;
import id.dekat.tenant.web.dto.CreateTenantRequest;
import id.dekat.tenant.web.dto.LocationRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TenantService")
class TenantServiceTest {

    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private LocationRepository locationRepository;

    @InjectMocks
    private TenantService tenantService;

    private UUID tenantId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
    }

    @Nested
    @DisplayName("createTenant")
    class CreateTenantTests {

        @Test
        @DisplayName("should create tenant successfully")
        void testCreateTenant_Success() {
            CreateTenantRequest request = new CreateTenantRequest(
                    "Barbershop Jakarta", "barbershop-jakarta", "BARBERSHOP",
                    "admin@barbershop.id", "+628123456789"
            );

            when(tenantRepository.existsBySlug(anyString())).thenReturn(false);
            when(tenantRepository.save(any(Tenant.class)))
                    .thenAnswer(invocation -> {
                        Tenant t = invocation.getArgument(0);
                        t.setId(tenantId);
                        return t;
                    });

            Tenant result = tenantService.createTenant(request);

            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("Barbershop Jakarta");
            assertThat(result.getSlug()).isEqualTo("barbershop-jakarta");
            assertThat(result.getStatus()).isEqualTo(VerificationStatus.DRAFT);
        }
    }

    @Nested
    @DisplayName("submitForReview")
    class SubmitForReviewTests {

        @Test
        @DisplayName("should submit draft tenant for review")
        void testSubmitForReview_Success() {
            Tenant tenant = createDraftTenant();
            when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

            Location location = Location.builder()
                    .tenantId(tenantId)
                    .name("Main Location")
                    .address("Jl. Sudirman No. 1")
                    .build();
            when(locationRepository.findByTenantId(tenantId)).thenReturn(List.of(location));
            when(tenantRepository.save(any(Tenant.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            Tenant result = tenantService.submitForReview(tenantId);

            assertThat(result.getStatus()).isEqualTo(VerificationStatus.SUBMITTED);
        }

        @Test
        @DisplayName("should throw when tenant is not in DRAFT status")
        void testSubmitForReview_InvalidStatus() {
            Tenant tenant = createDraftTenant();
            tenant.setStatus(VerificationStatus.APPROVED);
            when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

            assertThatThrownBy(() -> tenantService.submitForReview(tenantId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Only DRAFT tenants");
        }
    }

    @Nested
    @DisplayName("approveTenant")
    class ApproveTenantTests {

        @Test
        @DisplayName("should approve submitted tenant")
        void testApproveTenant_Success() {
            Tenant tenant = createDraftTenant();
            tenant.setStatus(VerificationStatus.SUBMITTED);
            when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
            when(tenantRepository.save(any(Tenant.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            Tenant result = tenantService.approveTenant(tenantId);

            assertThat(result.getStatus()).isEqualTo(VerificationStatus.APPROVED);
        }

        @Test
        @DisplayName("should throw when tenant is not submitted")
        void testApproveTenant_InvalidStatus() {
            Tenant tenant = createDraftTenant();
            when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

            assertThatThrownBy(() -> tenantService.approveTenant(tenantId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Only SUBMITTED or UNDER_REVIEW");
        }
    }

    @Nested
    @DisplayName("rejectTenant")
    class RejectTenantTests {

        @Test
        @DisplayName("should reject submitted tenant")
        void testRejectTenant_Success() {
            Tenant tenant = createDraftTenant();
            tenant.setStatus(VerificationStatus.SUBMITTED);
            when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
            when(tenantRepository.save(any(Tenant.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            Tenant result = tenantService.rejectTenant(tenantId, "Missing documents");

            assertThat(result.getStatus()).isEqualTo(VerificationStatus.REJECTED);
        }
    }

    @Nested
    @DisplayName("suspendTenant")
    class SuspendTenantTests {

        @Test
        @DisplayName("should suspend approved tenant")
        void testSuspendTenant_Success() {
            Tenant tenant = createDraftTenant();
            tenant.setStatus(VerificationStatus.APPROVED);
            when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
            when(tenantRepository.save(any(Tenant.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            Tenant result = tenantService.suspendTenant(tenantId);

            assertThat(result.getStatus()).isEqualTo(VerificationStatus.SUSPENDED);
        }

        @Test
        @DisplayName("should throw when tenant is not approved")
        void testSuspendTenant_InvalidStatus() {
            Tenant tenant = createDraftTenant();
            when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

            assertThatThrownBy(() -> tenantService.suspendTenant(tenantId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Only APPROVED tenants");
        }
    }

    @Nested
    @DisplayName("reactivateTenant")
    class ReactivateTenantTests {

        @Test
        @DisplayName("should reactivate suspended tenant")
        void testReactivateTenant_Success() {
            Tenant tenant = createDraftTenant();
            tenant.setStatus(VerificationStatus.SUSPENDED);
            when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
            when(tenantRepository.save(any(Tenant.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            Tenant result = tenantService.reactivateTenant(tenantId);

            assertThat(result.getStatus()).isEqualTo(VerificationStatus.APPROVED);
        }
    }

    @Nested
    @DisplayName("createLocation")
    class CreateLocationTests {

        @Test
        @DisplayName("should create location for approved tenant")
        void testCreateLocation_Success() {
            Tenant tenant = createDraftTenant();
            tenant.setStatus(VerificationStatus.APPROVED);
            when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
            when(locationRepository.save(any(Location.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            LocationRequest request = new LocationRequest(
                    "Main Branch", "Jl. Sudirman No. 1", -6.2088, 106.8456, "Asia/Jakarta"
            );

            Location result = tenantService.createLocation(tenantId, request);

            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("Main Branch");
            assertThat(result.getStatus()).isEqualTo("ACTIVE");
        }

        @Test
        @DisplayName("should throw when creating location for non-approved tenant")
        void testCreateLocation_InvalidTenantStatus() {
            Tenant tenant = createDraftTenant();
            tenant.setStatus(VerificationStatus.SUBMITTED);
            when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

            LocationRequest request = new LocationRequest(
                    "Main Branch", "Jl. Sudirman No. 1", -6.2088, 106.8456, "Asia/Jakarta"
            );

            assertThatThrownBy(() -> tenantService.createLocation(tenantId, request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Cannot add location");
        }
    }

    private Tenant createDraftTenant() {
        Tenant tenant = Tenant.builder()
                .id(tenantId)
                .name("Barbershop Jakarta")
                .slug("barbershop-jakarta")
                .category("BARBERSHOP")
                .contactEmail("admin@barbershop.id")
                .status(VerificationStatus.DRAFT)
                .build();
        return tenant;
    }
}