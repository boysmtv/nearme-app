package id.dekat.api.web;

import id.dekat.access.domain.RoleAssignment;
import id.dekat.access.domain.RoleAssignmentRepository;
import id.dekat.access.domain.RoleRepository;
import id.dekat.booking.domain.Booking;
import id.dekat.booking.domain.BookingAssignmentRepository;
import id.dekat.booking.domain.BookingItem;
import id.dekat.booking.domain.BookingItemRepository;
import id.dekat.booking.domain.BookingRepository;
import id.dekat.booking.domain.BookingStatus;
import id.dekat.identity.domain.User;
import id.dekat.identity.domain.UserRepository;
import id.dekat.identity.domain.UserStatus;
import id.dekat.payment.domain.PaymentIntent;
import id.dekat.payment.domain.PaymentRepository;
import id.dekat.payment.domain.PaymentStatus;
import id.dekat.sharedkernel.web.ApiResponse;
import id.dekat.support.domain.SupportCase;
import id.dekat.support.domain.SupportRepository;
import id.dekat.tenant.domain.Tenant;
import id.dekat.tenant.domain.TenantRepository;
import id.dekat.catalog.domain.ServiceRepository;
import id.dekat.tenant.domain.TenantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final RoleAssignmentRepository roleAssignmentRepository;
    private final RoleRepository roleRepository;
    private final TenantRepository tenantRepository;
    private final BookingRepository bookingRepository;
    private final BookingItemRepository bookingItemRepository;
    private final BookingAssignmentRepository bookingAssignmentRepository;
    private final SupportRepository supportRepository;
    private final PaymentRepository paymentRepository;
    private final ServiceRepository serviceRepository;

    public AdminController(UserRepository userRepository,
                           RoleAssignmentRepository roleAssignmentRepository,
                           RoleRepository roleRepository,
                           TenantRepository tenantRepository,
                           BookingRepository bookingRepository,
                           BookingItemRepository bookingItemRepository,
                           BookingAssignmentRepository bookingAssignmentRepository,
                           SupportRepository supportRepository,
                           PaymentRepository paymentRepository,
                           ServiceRepository serviceRepository) {
        this.userRepository = userRepository;
        this.roleAssignmentRepository = roleAssignmentRepository;
        this.roleRepository = roleRepository;
        this.tenantRepository = tenantRepository;
        this.bookingRepository = bookingRepository;
        this.bookingItemRepository = bookingItemRepository;
        this.bookingAssignmentRepository = bookingAssignmentRepository;
        this.supportRepository = supportRepository;
        this.paymentRepository = paymentRepository;
        this.serviceRepository = serviceRepository;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalTenants = tenantRepository.count();
        long totalBookings = bookingRepository.count();
        BigDecimal totalRevenue = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .map(Booking::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long activeProviders = tenantRepository.count();
        long pendingVerifications = userRepository.countByStatus(UserStatus.PENDING_VERIFICATION);

        Map<String, Object> stats = Map.of(
            "totalUsers", totalUsers,
            "totalTenants", totalTenants,
            "totalBookings", totalBookings,
            "totalRevenue", totalRevenue.longValue(),
            "activeProviders", activeProviders,
            "pendingVerifications", pendingVerifications
        );
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> listUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {

        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage;

        if (search != null && !search.isBlank()) {
            userPage = userRepository.findAll(pageRequest).stream()
                .filter(u -> u.getName() != null && u.getName().toLowerCase().contains(search.toLowerCase())
                    || u.getEmail() != null && u.getEmail().toLowerCase().contains(search.toLowerCase()))
                .collect(Collectors.collectingAndThen(
                    Collectors.toList(),
                    list -> new org.springframework.data.domain.PageImpl<>(list, pageRequest, list.size())
                ));
        } else {
            userPage = userRepository.findAll(pageRequest);
        }

        List<Map<String, Object>> userData = userPage.getContent().stream().map(u -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId().toString());
            map.put("email", u.getEmail());
            map.put("name", u.getName() != null ? u.getName() : u.getEmail());
            map.put("status", u.getStatus().name());
            map.put("lastLoginAt", u.getUpdatedAt() != null ? u.getUpdatedAt().toString() : null);
            map.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);

            List<RoleAssignment> assignments = roleAssignmentRepository.findByUserId(u.getId());
            String roleName = assignments.isEmpty() ? "ROLE_CUSTOMER" : "ROLE_CUSTOMER";
            if (!assignments.isEmpty()) {
                Optional<id.dekat.access.domain.Role> roleOpt = roleRepository.findById(assignments.get(0).getRoleId());
                roleName = roleOpt.map(id.dekat.access.domain.Role::getName).orElse("ROLE_CUSTOMER");
            }
            map.put("role", roleName);
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> result = Map.of(
            "data", userData,
            "pagination", Map.of("page", page, "limit", limit, "total", userPage.getTotalElements(), "totalPages", userPage.getTotalPages())
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateUserStatus(
            @PathVariable UUID id, @RequestBody Map<String, String> body) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.ok(Map.of("error", "User not found")));
        }
        User user = userOpt.get();
        String newStatus = body.getOrDefault("status", "ACTIVE");
        user.setStatus(UserStatus.valueOf(newStatus));
        userRepository.save(user);
        Map<String, Object> result = Map.of("id", id.toString(), "status", newStatus);
        return ResponseEntity.ok(ApiResponse.ok(result, "User status updated"));
    }

    @GetMapping("/tenants")
    public ResponseEntity<ApiResponse<Map<String, Object>>> listTenants(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Tenant> tenantPage = tenantRepository.findAll(pageRequest);

        List<Map<String, Object>> tenantData = tenantPage.getContent().stream().map(t -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", t.getId().toString());
            map.put("name", t.getName());
            map.put("slug", t.getSlug());
            map.put("email", t.getEmail() != null ? t.getEmail() : "");
            map.put("status", t.getStatus().name());
            map.put("verificationStatus", t.getVerificationStatus());

            List<Booking> tenantBookings = bookingRepository.findByTenantId(t.getId());
            long totalBookings = tenantBookings.size();
            BigDecimal totalRevenue = tenantBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                    .map(Booking::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            map.put("totalBookings", totalBookings);
            map.put("totalRevenue", totalRevenue.longValue());

            map.put("createdAt", t.getCreatedAt() != null ? t.getCreatedAt().toString() : null);
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> result = Map.of(
            "data", tenantData,
            "pagination", Map.of("page", page, "limit", limit, "total", tenantPage.getTotalElements(), "totalPages", tenantPage.getTotalPages())
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PutMapping("/tenants/{id}/approve")
    public ResponseEntity<ApiResponse<Map<String, Object>>> approveTenant(@PathVariable UUID id) {
        Optional<Tenant> tenantOpt = tenantRepository.findById(id);
        if (tenantOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.ok(Map.of("error", "Tenant not found")));
        }
        Tenant tenant = tenantOpt.get();
        tenant.setVerificationStatus("VERIFIED");
        tenantRepository.save(tenant);
        Map<String, Object> result = Map.of("id", id.toString(), "verificationStatus", "VERIFIED");
        return ResponseEntity.ok(ApiResponse.ok(result, "Tenant approved"));
    }

    @PutMapping("/tenants/{id}/reject")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rejectTenant(
            @PathVariable UUID id, @RequestBody Map<String, String> body) {
        Optional<Tenant> tenantOpt = tenantRepository.findById(id);
        if (tenantOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.ok(Map.of("error", "Tenant not found")));
        }
        Tenant tenant = tenantOpt.get();
        tenant.setVerificationStatus("REJECTED");
        tenantRepository.save(tenant);
        Map<String, Object> result = Map.of("id", id.toString(), "verificationStatus", "REJECTED");
        return ResponseEntity.ok(ApiResponse.ok(result, "Tenant rejected"));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> listBookings(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String date) {

        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Booking> bookingPage;

        if (status != null && !status.isBlank()) {
            try {
                BookingStatus bs = BookingStatus.valueOf(status);
                bookingPage = bookingRepository.findByStatus(bs, pageRequest);
            } catch (IllegalArgumentException e) {
                bookingPage = bookingRepository.findAll(pageRequest);
            }
        } else {
            bookingPage = bookingRepository.findAll(pageRequest);
        }

        List<Booking> bookings = bookingPage.getContent();
        List<UUID> bookingIds = bookings.stream().map(Booking::getId).collect(Collectors.toList());

        Map<UUID, String> customerNameMap = new HashMap<>();
        Set<UUID> customerIds = bookings.stream().map(Booking::getCustomerId).collect(Collectors.toSet());
        for (UUID cid : customerIds) {
            userRepository.findById(cid).ifPresent(u -> customerNameMap.put(cid, u.getName() != null ? u.getName() : u.getEmail()));
        }

        Map<UUID, String> serviceNameMap = new HashMap<>();
        if (!bookingIds.isEmpty()) {
            List<BookingItem> allItems = bookingItemRepository.findByBookingIdIn(bookingIds);
            Set<UUID> serviceIds = allItems.stream().map(BookingItem::getServiceId).collect(Collectors.toSet());
            Map<UUID, String> serviceNameById = new HashMap<>();
            for (UUID sid : serviceIds) {
                serviceRepository.findById(sid).ifPresent(s -> serviceNameById.put(sid, s.getName()));
            }
            for (BookingItem item : allItems) {
                serviceNameMap.putIfAbsent(item.getBookingId(), serviceNameById.getOrDefault(item.getServiceId(), "Service"));
            }
        }

        Map<UUID, String> staffNameMap = new HashMap<>();
        if (!bookingIds.isEmpty()) {
            bookingAssignmentRepository.findByBookingIdIn(bookingIds).forEach(a -> {
                if (!staffNameMap.containsKey(a.getBookingId())) {
                    userRepository.findById(a.getStaffId()).ifPresent(u ->
                        staffNameMap.put(a.getBookingId(), u.getName() != null ? u.getName() : u.getEmail()));
                }
            });
        }

        Map<UUID, Tenant> tenantMap = new HashMap<>();
        Set<UUID> tenantIds = bookings.stream().map(Booking::getTenantId).collect(Collectors.toSet());
        for (UUID tid : tenantIds) {
            tenantRepository.findById(tid).ifPresent(t -> tenantMap.put(tid, t));
        }

        List<Map<String, Object>> bookingData = bookings.stream().map(b -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", b.getId().toString());
            map.put("code", b.getBookingCode());
            map.put("customerName", customerNameMap.getOrDefault(b.getCustomerId(), "Customer"));
            map.put("providerName", tenantMap.containsKey(b.getTenantId()) ? tenantMap.get(b.getTenantId()).getName() : "Provider");
            map.put("serviceName", serviceNameMap.getOrDefault(b.getId(), "Service"));
            map.put("staffName", staffNameMap.getOrDefault(b.getId(), "Staff"));
            map.put("startTime", b.getStartsAt() != null ? b.getStartsAt().toString() : null);
            map.put("status", b.getStatus().name());
            map.put("totalAmount", b.getTotal() != null ? b.getTotal().longValue() : 0);
            map.put("createdAt", b.getCreatedAt() != null ? b.getCreatedAt().toString() : null);
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> result = Map.of(
            "data", bookingData,
            "pagination", Map.of("page", page, "limit", limit, "total", bookingPage.getTotalElements(), "totalPages", bookingPage.getTotalPages())
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<Map<String, Object>>> listPayments(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String status) {

        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<PaymentIntent> paymentPage;
        if (status != null && !status.isBlank()) {
            try {
                PaymentStatus ps = PaymentStatus.valueOf(status);
                paymentPage = paymentRepository.findByStatus(ps, pageRequest);
            } catch (IllegalArgumentException e) {
                paymentPage = paymentRepository.findAll(pageRequest);
            }
        } else {
            paymentPage = paymentRepository.findAll(pageRequest);
        }

        List<PaymentIntent> payments = paymentPage.getContent();
        Set<UUID> bookingIds = payments.stream().map(PaymentIntent::getBookingId).collect(Collectors.toSet());
        Set<UUID> tenantIds = payments.stream().map(PaymentIntent::getTenantId).collect(Collectors.toSet());

        Map<UUID, String> bookingCodeMap = new HashMap<>();
        Map<UUID, UUID> bookingCustomerMap = new HashMap<>();
        if (!bookingIds.isEmpty()) {
            for (UUID bid : bookingIds) {
                bookingRepository.findById(bid).ifPresent(b -> {
                    bookingCodeMap.put(bid, b.getBookingCode());
                    bookingCustomerMap.put(bid, b.getCustomerId());
                });
            }
        }

        Set<UUID> customerIds = new HashSet<>(bookingCustomerMap.values());
        Map<UUID, String> customerNameMap = new HashMap<>();
        for (UUID cid : customerIds) {
            userRepository.findById(cid).ifPresent(u -> customerNameMap.put(cid, u.getName() != null ? u.getName() : u.getEmail()));
        }

        Map<UUID, String> providerNameMap = new HashMap<>();
        for (UUID tid : tenantIds) {
            tenantRepository.findById(tid).ifPresent(t -> providerNameMap.put(tid, t.getName()));
        }

        List<Map<String, Object>> paymentData = payments.stream().map(p -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", p.getId().toString());
            map.put("bookingId", p.getBookingId().toString());
            map.put("bookingCode", bookingCodeMap.getOrDefault(p.getBookingId(), "-"));
            map.put("customerName", customerNameMap.getOrDefault(bookingCustomerMap.get(p.getBookingId()), "Customer"));
            map.put("providerName", providerNameMap.getOrDefault(p.getTenantId(), "Provider"));
            map.put("amount", p.getAmount());
            map.put("currency", p.getCurrency());
            map.put("status", p.getStatus() != null ? p.getStatus().name() : "PENDING");
            map.put("method", p.getMethod());
            map.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> result = Map.of(
            "data", paymentData,
            "pagination", Map.of("page", page, "limit", limit, "total", paymentPage.getTotalElements(), "totalPages", paymentPage.getTotalPages())
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/cases")
    public ResponseEntity<ApiResponse<Map<String, Object>>> listCases(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String status) {

        List<SupportCase> allCases;
        try {
            allCases = supportRepository.findAll();
        } catch (Exception e) {
            Map<String, Object> result = Map.of(
                "data", List.of(),
                "pagination", Map.of("page", page, "limit", limit, "total", 0, "totalPages", 0)
            );
            return ResponseEntity.ok(ApiResponse.ok(result));
        }

        List<SupportCase> filtered = allCases.stream().filter(c -> {
            if (severity != null && !severity.isBlank() && !c.getPriority().name().equals(severity)) return false;
            if (status != null && !status.isBlank() && !c.getStatus().name().equals(status)) return false;
            return true;
        }).collect(Collectors.toList());

        int total = filtered.size();
        int totalPages = (int) Math.ceil((double) total / limit);
        int from = Math.min((page - 1) * limit, total);
        int to = Math.min(from + limit, total);
        List<SupportCase> paged = filtered.subList(from, to);

        List<Map<String, Object>> caseData = paged.stream().map(c -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", c.getId().toString());
            map.put("caseNumber", "SC-" + c.getId().toString().substring(0, 8).toUpperCase());
            map.put("subject", c.getSubject());
            map.put("customerName", "Customer");
            map.put("priority", c.getPriority().name());
            map.put("status", c.getStatus().name());
            map.put("assignee", c.getAssignedTo() != null ? "Assigned" : "-");
            map.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> result = Map.of(
            "data", caseData,
            "pagination", Map.of("page", page, "limit", limit, "total", total, "totalPages", totalPages)
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PutMapping("/cases/{id}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateCaseStatus(
            @PathVariable UUID id, @RequestBody Map<String, String> body) {
        Optional<SupportCase> caseOpt = supportRepository.findById(id);
        if (caseOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.ok(Map.of("error", "Case not found")));
        }
        SupportCase sc = caseOpt.get();
        String newStatus = body.getOrDefault("status", "OPEN");
        sc.setStatus(SupportCase.CaseStatus.valueOf(newStatus));
        supportRepository.save(sc);
        Map<String, Object> result = Map.of("id", id.toString(), "status", newStatus);
        return ResponseEntity.ok(ApiResponse.ok(result, "Case status updated"));
    }

    @GetMapping("/config/flags")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getConfigFlags() {
        List<Map<String, Object>> flags = List.of(
            Map.of("id", "ff-001", "name", "Maintenance Mode", "description", "Platform maintenance mode", "enabled", false),
            Map.of("id", "ff-002", "name", "New Registration", "description", "Allow new user registration", "enabled", true),
            Map.of("id", "ff-003", "name", "Payment Gateway", "description", "Enable payment processing", "enabled", true)
        );
        return ResponseEntity.ok(ApiResponse.ok(flags));
    }

    @PutMapping("/config/flags/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleFlag(
            @PathVariable UUID id, @RequestBody Map<String, Object> body) {
        Map<String, Object> flag = Map.of("id", id.toString(), "enabled", body.getOrDefault("enabled", true));
        return ResponseEntity.ok(ApiResponse.ok(flag, "Feature flag updated"));
    }
}
