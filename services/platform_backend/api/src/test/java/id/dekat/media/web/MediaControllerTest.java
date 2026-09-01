package id.dekat.media.web;

import id.dekat.media.application.MediaService;
import id.dekat.media.domain.MediaAsset;
import id.dekat.media.domain.MediaRepository;
import id.dekat.sharedkernel.web.ApiResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MediaController Tests")
class MediaControllerTest {

    @Mock
    private MediaService mediaService;
    @Mock
    private MediaRepository mediaRepository;

    @InjectMocks
    private MediaController controller;

    private Jwt mockJwt(String subject) {
        Jwt jwt = mock(Jwt.class);
        lenient().when(jwt.getSubject()).thenReturn(subject);
        return jwt;
    }

    @Test
    @DisplayName("upload without JWT returns 401")
    void upload_withoutJwt_unauthorized() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "a.jpg", "image/jpeg", new byte[]{1});
        ResponseEntity<ApiResponse<java.util.Map<String,Object>>> resp = controller.upload(null, UUID.randomUUID(), file, "provider", UUID.randomUUID(), 0);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("upload with JWT succeeds")
    void upload_withJwt_succeeds() throws Exception {
        UUID tenantId = UUID.randomUUID();
        UUID ownerId = tenantId;
        MockMultipartFile file = new MockMultipartFile("file", "a.jpg", "image/jpeg", new byte[]{1});
        MediaAsset asset = MediaAsset.builder()
                .id(UUID.randomUUID()).tenantId(tenantId).ownerType("provider").ownerId(ownerId)
                .fileName("a.jpg").contentType("image/jpeg").fileSize(1L)
                .storagePath("/tmp/a.jpg").url("/uploads/a.jpg").sortOrder(0).createdAt(Instant.now()).build();
        when(mediaService.upload(any(), eq("provider"), eq(ownerId), any(), any())).thenReturn(asset);
        when(mediaService.signedUrl(any(MediaAsset.class), anyLong())).thenReturn("/uploads/a.jpg?expiry=1");
        Jwt jwt = mockJwt(UUID.randomUUID().toString());
        ResponseEntity<ApiResponse<java.util.Map<String,Object>>> resp = controller.upload(jwt, tenantId, file, "provider", ownerId, 0);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().isSuccess()).isTrue();
    }

    @Test
    @DisplayName("upload rejects invalid ownerType")
    void upload_invalidOwnerType_badRequest() throws Exception {
        Jwt jwt = mockJwt(UUID.randomUUID().toString());
        MockMultipartFile file = new MockMultipartFile("file", "a.jpg", "image/jpeg", new byte[]{1});
        ResponseEntity<ApiResponse<java.util.Map<String,Object>>> resp = controller.upload(jwt, UUID.randomUUID(), file, "invalid", UUID.randomUUID(), 0);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("getMedia without JWT returns 401")
    void getMedia_withoutJwt_unauthorized() {
        ResponseEntity<ApiResponse<java.util.Map<String,Object>>> resp = controller.getMedia(null, UUID.randomUUID());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("listProviderMedia without JWT returns 401")
    void list_withoutJwt_unauthorized() {
        ResponseEntity<ApiResponse<List<java.util.Map<String,Object>>>> resp = controller.listProviderMedia(null, UUID.randomUUID(), null, null);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("deleteMedia without JWT returns 401")
    void delete_withoutJwt_unauthorized() {
        ResponseEntity<ApiResponse<Void>> resp = controller.deleteMedia(null, UUID.randomUUID(), UUID.randomUUID());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("getPublicProviderMedia returns ok")
    void getPublic_ok() {
        UUID providerId = UUID.randomUUID();
        when(mediaService.listByTenantPublic(providerId)).thenReturn(List.of());
        ResponseEntity<ApiResponse<List<java.util.Map<String,Object>>>> resp = controller.getPublicProviderMedia(providerId);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody().isSuccess()).isTrue();
    }

    @Test
    @DisplayName("reorder without JWT returns 401")
    void reorder_withoutJwt_unauthorized() {
        ResponseEntity<ApiResponse<Void>> resp = controller.reorder(null, UUID.randomUUID(), java.util.Map.of("orderedIds", List.of(UUID.randomUUID())));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
