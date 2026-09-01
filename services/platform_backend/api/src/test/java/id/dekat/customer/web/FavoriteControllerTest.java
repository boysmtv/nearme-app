package id.dekat.customer.web;

import id.dekat.customer.domain.CustomerFavoriteRepository;
import id.dekat.staff.domain.Staff;
import id.dekat.staff.domain.StaffRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import id.dekat.customer.domain.CustomerFavorite;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FavoriteController.class)
@DisplayName("FavoriteController Tests")
class FavoriteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CustomerFavoriteRepository favoriteRepository;

    @MockBean
    private StaffRepository staffRepository;

    @Test
    @DisplayName("GET /customer/favorites requires JWT")
    void list_requiresJwt() throws Exception {
        mockMvc.perform(get("/customer/favorites"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /customer/favorites/{staffId} requires JWT")
    void add_requiresJwt() throws Exception {
        // without JWT but with csrf, should be 401; without csrf may be 403 depending on config -> accept either 401 or 403
        var result = mockMvc.perform(post("/customer/favorites/" + UUID.randomUUID()).with(csrf()))
                .andReturn();
        int status = result.getResponse().getStatus();
        if (!(status == 401 || status == 403)) throw new AssertionError("Expected 401 or 403 but was " + status);
    }

    @Test
    @DisplayName("GET /customer/favorites with JWT returns list")
    void list_withJwt_returnsOk() throws Exception {
        when(favoriteRepository.findByCustomerId(any())).thenReturn(List.of());
        mockMvc.perform(get("/customer/favorites")
                        .with(jwt().jwt(j -> j.subject(UUID.randomUUID().toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST favorite with valid staff succeeds")
    void add_withValidStaff_succeeds() throws Exception {
        UUID staffId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        when(staffRepository.findById(staffId)).thenReturn(Optional.of(mock(Staff.class)));
        when(favoriteRepository.existsByCustomerIdAndStaffId(any(), eq(staffId))).thenReturn(false);
        when(favoriteRepository.save(any())).thenAnswer(inv -> {
            CustomerFavorite f = inv.getArgument(0);
            if (f.getId() == null) f.setId(UUID.randomUUID());
            try {
                var field = CustomerFavorite.class.getDeclaredField("createdAt");
                field.setAccessible(true);
                if (field.get(f) == null) field.set(f, java.time.Instant.now());
            } catch (Exception ignored) {}
            return f;
        });

        mockMvc.perform(post("/customer/favorites/" + staffId)
                        .with(jwt().jwt(j -> j.subject(userId.toString()))).with(csrf()))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("POST favorite duplicate returns 409")
    void add_duplicate_returnsConflict() throws Exception {
        UUID staffId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        when(staffRepository.findById(staffId)).thenReturn(Optional.of(mock(Staff.class)));
        when(favoriteRepository.existsByCustomerIdAndStaffId(any(), eq(staffId))).thenReturn(true);

        mockMvc.perform(post("/customer/favorites/" + staffId)
                        .with(jwt().jwt(j -> j.subject(userId.toString()))))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("DELETE favorite not found returns 404")
    void delete_notFound_returns404() throws Exception {
        UUID staffId = UUID.randomUUID();
        when(favoriteRepository.findByCustomerIdAndStaffId(any(), eq(staffId))).thenReturn(Optional.empty());
        mockMvc.perform(delete("/customer/favorites/" + staffId)
                        .with(jwt().jwt(j -> j.subject(UUID.randomUUID().toString()))))
                .andExpect(status().isNotFound());
    }
}
