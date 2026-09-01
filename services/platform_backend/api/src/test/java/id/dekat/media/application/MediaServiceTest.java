package id.dekat.media.application;

import id.dekat.media.domain.MediaAsset;
import id.dekat.media.domain.MediaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Path;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MediaService Unit Tests")
class MediaServiceTest {

    @Mock
    private MediaRepository mediaRepository;

    @InjectMocks
    private MediaService mediaService;

    @TempDir
    Path tempDir;

    private UUID tenantId;
    private UUID ownerId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        ownerId = UUID.randomUUID();
        ReflectionTestUtils.setField(mediaService, "basePath", tempDir.toString());
    }

    @Test
    @DisplayName("upload valid jpeg succeeds")
    void upload_validJpeg_succeeds() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "photo.jpg", "image/jpeg", new byte[]{1,2,3});
        when(mediaRepository.save(any(MediaAsset.class))).thenAnswer(inv -> {
            MediaAsset a = inv.getArgument(0);
            a.setId(UUID.randomUUID());
            return a;
        });

        MediaAsset result = mediaService.upload(tenantId, "provider", ownerId, file, 0);

        assertThat(result).isNotNull();
        assertThat(result.getTenantId()).isEqualTo(tenantId);
        assertThat(result.getContentType()).isEqualTo("image/jpeg");
        assertThat(result.getUrl()).startsWith("/uploads/");
        verify(mediaRepository).save(any(MediaAsset.class));
    }

    @Test
    @DisplayName("upload rejects invalid content type")
    void upload_invalidContentType_throws() {
        MockMultipartFile file = new MockMultipartFile("file", "doc.pdf", "application/pdf", new byte[]{1,2,3});
        assertThatThrownBy(() -> mediaService.upload(tenantId, "provider", ownerId, file, 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unsupported content type");
    }

    @Test
    @DisplayName("upload rejects too large file")
    void upload_tooLarge_throws() {
        byte[] large = new byte[11 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile("file", "big.jpg", "image/jpeg", large);
        assertThatThrownBy(() -> mediaService.upload(tenantId, "provider", ownerId, file, 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("File too large");
    }

    @Test
    @DisplayName("upload rejects invalid ownerType")
    void upload_invalidOwnerType_throws() {
        MockMultipartFile file = new MockMultipartFile("file", "photo.jpg", "image/jpeg", new byte[]{1,2,3});
        assertThatThrownBy(() -> mediaService.upload(tenantId, "invalid", ownerId, file, 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid owner_type");
    }

    @Test
    @DisplayName("signedUrl appends expiry")
    void signedUrl_appendsExpiry() {
        MediaAsset asset = MediaAsset.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .ownerType("provider")
                .ownerId(ownerId)
                .fileName("photo.jpg")
                .contentType("image/jpeg")
                .fileSize(123L)
                .storagePath(tempDir.resolve("a.jpg").toString())
                .url("/uploads/a.jpg")
                .sortOrder(0)
                .build();
        String signed = mediaService.signedUrl(asset, 3600);
        assertThat(signed).startsWith("/uploads/a.jpg?expiry=");
    }

    @Test
    @DisplayName("upload accepts png and webp")
    void upload_pngAndWebp_succeeds() throws Exception {
        when(mediaRepository.save(any(MediaAsset.class))).thenAnswer(inv -> {
            MediaAsset a = inv.getArgument(0);
            a.setId(UUID.randomUUID());
            return a;
        });
        MockMultipartFile png = new MockMultipartFile("file", "img.png", "image/png", new byte[]{1});
        MockMultipartFile webp = new MockMultipartFile("file", "img.webp", "image/webp", new byte[]{1});
        assertThat(mediaService.upload(tenantId, "staff", ownerId, png, 1)).isNotNull();
        assertThat(mediaService.upload(tenantId, "staff", ownerId, webp, 2)).isNotNull();
    }
}
