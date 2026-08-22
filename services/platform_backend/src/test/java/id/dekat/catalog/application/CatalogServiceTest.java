package id.dekat.catalog.application;

import id.dekat.catalog.domain.*;
import id.dekat.catalog.web.dto.ServiceRequest;
import id.dekat.catalog.web.dto.ServiceResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CatalogService")
class CatalogServiceTest {

    @Mock
    private ServiceRepository serviceRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private ServiceVariantRepository variantRepository;
    @Mock
    private ServiceAddonRepository addonRepository;

    @InjectMocks
    private CatalogService catalogService;

    private UUID tenantId;
    private UUID serviceId;
    private UUID categoryId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        serviceId = UUID.randomUUID();
        categoryId = UUID.randomUUID();
    }

    @Nested
    @DisplayName("createService")
    class CreateServiceTests {

        @Test
        @DisplayName("should create service successfully")
        void testCreateService_Success() {
            ServiceRequest request = new ServiceRequest();
            request.setCategoryId(categoryId);
            request.setName("Haircut");
            request.setSlug("haircut");
            request.setDurationMinutes(30);
            request.setPriceType(PriceType.FIXED);
            request.setBasePriceAmount(new BigDecimal("50000"));
            request.setCurrency("IDR");

            when(serviceRepository.existsBySlug(anyString())).thenReturn(false);
            when(serviceRepository.save(any(ServiceItem.class)))
                    .thenAnswer(invocation -> {
                        ServiceItem s = invocation.getArgument(0);
                        s.setId(serviceId);
                        return s;
                    });

            ServiceItem result = catalogService.createService(tenantId, request);

            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("Haircut");
            assertThat(result.getSlug()).isEqualTo("haircut");
            assertThat(result.getStatus()).isEqualTo("DRAFT");
            assertThat(result.getVisibility()).isEqualTo("PRIVATE");
            verify(serviceRepository).save(any(ServiceItem.class));
        }

        @Test
        @DisplayName("should generate unique slug when duplicate exists")
        void testCreateService_UniqueSlug() {
            ServiceRequest request = new ServiceRequest();
            request.setCategoryId(categoryId);
            request.setName("Haircut");
            request.setSlug("haircut");
            request.setDurationMinutes(30);
            request.setPriceType(PriceType.FIXED);
            request.setBasePriceAmount(new BigDecimal("50000"));

            when(serviceRepository.existsBySlug("haircut")).thenReturn(true);
            when(serviceRepository.existsBySlug("haircut-1")).thenReturn(false);
            when(serviceRepository.save(any(ServiceItem.class)))
                    .thenAnswer(invocation -> {
                        ServiceItem s = invocation.getArgument(0);
                        s.setId(serviceId);
                        return s;
                    });

            ServiceItem result = catalogService.createService(tenantId, request);

            assertThat(result.getSlug()).isEqualTo("haircut-1");
        }
    }

    @Nested
    @DisplayName("publishService")
    class PublishServiceTests {

        @Test
        @DisplayName("should publish draft service")
        void testPublishService_Success() {
            ServiceItem service = createDraftService();

            when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
            when(serviceRepository.save(any(ServiceItem.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            ServiceItem result = catalogService.publishService(serviceId);

            assertThat(result.getStatus()).isEqualTo("ACTIVE");
            assertThat(result.getVisibility()).isEqualTo("PUBLIC");
        }

        @Test
        @DisplayName("should throw when service is already published")
        void testPublishService_AlreadyPublished() {
            ServiceItem service = createDraftService();
            service.setStatus("ACTIVE");
            service.setVisibility("PUBLIC");

            when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));

            assertThatThrownBy(() -> catalogService.publishService(serviceId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("already published");
        }

        @Test
        @DisplayName("should throw when service name is missing")
        void testPublishService_MissingName() {
            ServiceItem service = createDraftService();
            service.setName(null);

            when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));

            assertThatThrownBy(() -> catalogService.publishService(serviceId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("name is required");
        }
    }

    @Nested
    @DisplayName("createVariant")
    class CreateVariantTests {

        @Test
        @DisplayName("should create variant successfully")
        void testCreateVariant_Success() {
            ServiceItem service = createDraftService();
            when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
            when(variantRepository.save(any(ServiceVariant.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            ServiceVariant result = catalogService.createVariant(
                    serviceId, "Premium", new BigDecimal("80000"), 45, "Premium cut");

            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("Premium");
            verify(variantRepository).save(any(ServiceVariant.class));
        }
    }

    @Nested
    @DisplayName("createAddon")
    class CreateAddonTests {

        @Test
        @DisplayName("should create addon successfully")
        void testCreateAddon_Success() {
            ServiceItem service = createDraftService();
            when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
            when(addonRepository.save(any(ServiceAddon.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            ServiceAddon result = catalogService.createAddon(
                    serviceId, "Shampoo Treatment", new BigDecimal("25000"), 15, 1, false);

            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("Shampoo Treatment");
            verify(addonRepository).save(any(ServiceAddon.class));
        }
    }

    private ServiceItem createDraftService() {
        return ServiceItem.builder()
                .id(serviceId)
                .tenantId(tenantId)
                .categoryId(categoryId)
                .name("Haircut")
                .slug("haircut")
                .durationMinutes(30)
                .priceType(PriceType.FIXED)
                .basePriceAmount(new BigDecimal("50000"))
                .currency("IDR")
                .status("DRAFT")
                .visibility("PRIVATE")
                .build();
    }
}