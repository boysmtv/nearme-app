package id.dekat.api.web;

import id.dekat.booking.application.BookingService;
import id.dekat.booking.domain.Booking;
import id.dekat.booking.domain.BookingRepository;
import id.dekat.booking.domain.BookingStatus;
import id.dekat.catalog.domain.ServiceOffering;
import id.dekat.catalog.domain.ServiceOfferingRepository;
import id.dekat.common.NotFoundException;
import id.dekat.customer.domain.CustomerProfile;
import id.dekat.customer.domain.CustomerProfileRepository;
import id.dekat.identity.domain.User;
import id.dekat.identity.domain.UserRepository;
import id.dekat.platformconfig.domain.ConfigVersion;
import id.dekat.platformconfig.domain.ConfigVersionRepository;
import id.dekat.review.domain.PublicReview;
import id.dekat.review.domain.PublicReviewRepository;
import id.dekat.sharedkernel.web.ApiResponse;
import id.dekat.tenant.domain.ProviderListing;
import id.dekat.tenant.domain.ProviderListingRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/provider")
public class ProviderDashboardController {

    private static final ZoneId WIB = ZoneId.of("Asia/Jakarta");
    private static final String SETTINGS_PREFIX = "provider_settings:";

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final ProviderListingRepository providerListingRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final UserRepository userRepository;
    private final PublicReviewRepository publicReviewRepository;
    private final ConfigVersionRepository configVersionRepository;

    public ProviderDashboardController(BookingRepository bookingRepository,
                                       BookingService bookingService,
                                       ServiceOfferingRepository serviceOfferingRepository,
                                       ProviderListingRepository providerListingRepository,
                                       CustomerProfileRepository customerProfileRepository,
                                       UserRepository userRepository,
                                       PublicReviewRepository publicReviewRepository,
                                       ConfigVersionRepository configVersionRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
        this.serviceOfferingRepository = serviceOfferingRepository;
        this.providerListingRepository = providerListingRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.userRepository = userRepository;
        this.publicReviewRepository = publicReviewRepository;
        this.configVersionRepository = configVersionRepository;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantIdHeader) {
        UUID tenantId = resolveTenant(tenantIdHeader);
        LocalDate today = LocalDate.now(WIB);
        OffsetDateTime dayStart = today.atStartOfDay(WIB).toOffsetDateTime();
        OffsetDateTime dayEnd = today.plusDays(1).atStartOfDay(WIB).toOffsetDateTime();
        OffsetDateTime weekStart = today.minusDays(6).atStartOfDay(WIB).toOffsetDateTime();

        List<Booking> todayBookings = countActive(bookingRepository.findByTenantIdAndStartsAtBetween(tenantId, dayStart, dayEnd));
        List<Booking> weekBookings = countActive(bookingRepository.findByTenantIdAndStartsAtBetween(tenantId, weekStart, dayEnd));
        long todayRevenue = sumRevenue(bookingRepository.findByTenantIdAndStartsAtBetween(tenantId, dayStart, dayEnd));
        long weekRevenue = sumRevenue(bookingRepository.findByTenantIdAndStartsAtBetween(tenantId, weekStart, dayEnd));
        Set<UUID> customers = bookingRepository.findByTenantId(tenantId).stream()
                .map(Booking::getCustomerId)
                .collect(Collectors.toSet());
        Double avgRating = publicReviewRepository.averageRating(tenantId);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("todayBookings", todayBookings.size());
        stats.put("todayRevenue", todayRevenue);
        stats.put("weekBookings", weekBookings.size());
        stats.put("weekRevenue", weekRevenue);
        stats.put("totalCustomers", customers.size());
        stats.put("avgRating", avgRating == null ? 0.0 : Math.round(avgRating * 10.0) / 10.0);
        stats.put("currency", "IDR");
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/dashboard/recent-bookings")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecentBookings(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantIdHeader) {
        UUID tenantId = resolveTenant(tenantIdHeader);
        Page<Booking> latest = bookingRepository.findByTenantId(tenantId,
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<Map<String, Object>> bookings = latest.getContent().stream()
                .map(this::toBookingRow)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(bookings));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> listBookings(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantIdHeader,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String date) {
        UUID tenantId = resolveTenant(tenantIdHeader);
        int safePage = Math.max(1, page);
        int safeLimit = Math.max(1, limit);

        List<Map<String, Object>> data;
        long total;
        int totalPages;
        if (date != null && !date.isBlank()) {
            LocalDate day = LocalDate.parse(date);
            List<Booking> dayBookings = bookingRepository.findByTenantIdAndStartsAtBetween(
                    tenantId,
                    day.atStartOfDay(WIB).toOffsetDateTime(),
                    day.plusDays(1).atStartOfDay(WIB).toOffsetDateTime());
            BookingStatus statusFilter = parseStatus(status);
            List<Booking> filtered = dayBookings.stream()
                    .filter(b -> statusFilter == null || b.getStatus() == statusFilter)
                    .collect(Collectors.toList());
            total = filtered.size();
            totalPages = (int) Math.ceil((double) total / safeLimit);
            int from = Math.min((safePage - 1) * safeLimit, filtered.size());
            int to = Math.min(from + safeLimit, filtered.size());
            data = filtered.subList(from, to).stream().map(this::toBookingRow).collect(Collectors.toList());
        } else {
            BookingStatus statusFilter = parseStatus(status);
            Page<Booking> result = statusFilter != null
                    ? bookingRepository.findByTenantIdAndStatus(tenantId, statusFilter,
                            PageRequest.of(safePage - 1, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt")))
                    : bookingRepository.findByTenantId(tenantId,
                            PageRequest.of(safePage - 1, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt")));
            total = result.getTotalElements();
            totalPages = result.getTotalPages();
            data = result.getContent().stream().map(this::toBookingRow).collect(Collectors.toList());
        }
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("data", data);
        payload.put("pagination", Map.of("page", safePage, "limit", safeLimit, "total", total, "totalPages", totalPages));
        return ResponseEntity.ok(ApiResponse.ok(payload));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBooking(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantIdHeader,
            @PathVariable UUID id) {
        UUID tenantId = resolveTenant(tenantIdHeader);
        Optional<Booking> found = bookingRepository.findByTenantIdAndId(tenantId, id);
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Booking not found"));
        }
        return ResponseEntity.ok(ApiResponse.ok(toBookingRow(found.get())));
    }

    @PutMapping("/bookings/{id}/status")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateBookingStatus(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantIdHeader,
            @RequestHeader(value = "X-Actor-Id", required = false) UUID actorHeader,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        UUID tenantId = resolveTenant(tenantIdHeader);
        UUID actor = actorHeader != null ? actorHeader : tenantId;
        String target = body.getOrDefault("status", body.getOrDefault("action", ""));
        try {
            Booking updated;
            switch (target) {
                case "CONFIRMED" -> {
                    Booking booking = requireBooking(tenantId, id);
                    booking.confirm();
                    updated = bookingRepository.save(booking);
                }
                case "CANCELLED" -> updated = bookingService.cancelBooking(id, body.get("reason"), actor);
                case "CHECKED_IN" -> updated = bookingService.checkIn(id, actor);
                case "IN_SERVICE", "IN_PROGRESS", "STARTED" -> updated = bookingService.startService(id, actor);
                case "COMPLETED" -> updated = bookingService.completeService(id, actor);
                case "NO_SHOW" -> updated = bookingService.recordNoShow(id, actor);
                default -> {
                    return ResponseEntity.badRequest().body(ApiResponse.error("Unsupported status: " + target));
                }
            }
            return ResponseEntity.ok(ApiResponse.ok(toBookingRow(updated), "Booking status updated"));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listServices(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantIdHeader) {
        UUID tenantId = resolveTenant(tenantIdHeader);
        List<Map<String, Object>> services = serviceOfferingRepository.findByTenantIdOrderByNameAsc(tenantId)
                .stream()
                .map(this::toServiceRow)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(services));
    }

    @PostMapping("/services")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> createService(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantIdHeader,
            @RequestBody Map<String, Object> request) {
        UUID tenantId = resolveTenant(tenantIdHeader);
        ServiceOffering service = new ServiceOffering();
        service.setTenantId(tenantId);
        applyServiceFields(service, request);
        if (service.getName() == null || service.getName().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("name is required"));
        }
        ServiceOffering saved = serviceOfferingRepository.save(service);
        return ResponseEntity.ok(ApiResponse.ok(toServiceRow(saved), "Service created"));
    }

    @PutMapping("/services/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateService(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantIdHeader,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request) {
        UUID tenantId = resolveTenant(tenantIdHeader);
        Optional<ServiceOffering> found = serviceOfferingRepository.findById(id)
                .filter(s -> s.getTenantId().equals(tenantId));
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Service not found"));
        }
        ServiceOffering service = found.get();
        applyServiceFields(service, request);
        ServiceOffering saved = serviceOfferingRepository.save(service);
        return ResponseEntity.ok(ApiResponse.ok(toServiceRow(saved), "Service updated"));
    }

    @DeleteMapping("/services/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteService(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantIdHeader,
            @PathVariable UUID id) {
        UUID tenantId = resolveTenant(tenantIdHeader);
        Optional<ServiceOffering> found = serviceOfferingRepository.findById(id)
                .filter(s -> s.getTenantId().equals(tenantId));
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Service not found"));
        }
        ServiceOffering service = found.get();
        service.setIsActive(false);
        serviceOfferingRepository.save(service);
        return ResponseEntity.ok(ApiResponse.ok(null, "Service deleted"));
    }

    @PostMapping("/staff/invite")
    public ResponseEntity<ApiResponse<Map<String, Object>>> inviteStaff(@RequestBody Map<String, Object> request) {
        Map<String, Object> staff = Map.of(
                "id", UUID.randomUUID().toString(),
                "name", request.getOrDefault("name", ""),
                "email", request.getOrDefault("email", ""),
                "role", request.getOrDefault("role", "STAFF"),
                "active", true
        );
        return ResponseEntity.ok(ApiResponse.ok(staff, "Staff invitation sent"));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<Map<String, Object>>> listCustomers(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantIdHeader,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String search) {
        UUID tenantId = resolveTenant(tenantIdHeader);
        Map<UUID, List<Booking>> byCustomer = bookingRepository.findByTenantId(tenantId).stream()
                .collect(Collectors.groupingBy(Booking::getCustomerId));
        String needle = search != null ? search.toLowerCase(Locale.ROOT) : null;
        List<Map<String, Object>> customers = new ArrayList<>();
        for (Map.Entry<UUID, List<Booking>> entry : byCustomer.entrySet()) {
            Map<String, Object> row = toCustomerRow(entry.getKey(), entry.getValue());
            if (needle != null && !needle.isBlank()) {
                boolean hit = contains(row.get("name"), needle)
                        || contains(row.get("phone"), needle)
                        || contains(row.get("email"), needle);
                if (!hit) {
                    continue;
                }
            }
            customers.add(row);
        }
        customers.sort(Comparator.comparing(r -> Objects.toString(r.get("name"), ""), String.CASE_INSENSITIVE_ORDER));
        int safeLimit = Math.max(1, limit);
        int safePage = Math.max(1, page);
        int from = Math.min((safePage - 1) * safeLimit, customers.size());
        int to = Math.min(from + safeLimit, customers.size());
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("data", customers.subList(from, to));
        payload.put("pagination", Map.of(
                "page", safePage,
                "limit", safeLimit,
                "total", customers.size(),
                "totalPages", (int) Math.ceil((double) customers.size() / safeLimit)));
        return ResponseEntity.ok(ApiResponse.ok(payload));
    }

    @GetMapping("/calendar")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCalendarBookings(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantIdHeader,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        UUID tenantId = resolveTenant(tenantIdHeader);
        List<Booking> bookings;
        try {
            bookings = bookingRepository.findByTenantIdAndStartsAtBetween(
                    tenantId,
                    LocalDate.parse(startDate).atStartOfDay(WIB).toOffsetDateTime(),
                    LocalDate.parse(endDate).plusDays(1).atStartOfDay(WIB).toOffsetDateTime());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("startDate/endDate must be yyyy-MM-dd"));
        }
        List<Map<String, Object>> events = bookings.stream()
                .sorted(Comparator.comparing(Booking::getStartsAt))
                .map(b -> {
                    Map<String, Object> row = toBookingRow(b);
                    row.put("startsAt", b.getStartsAt());
                    row.put("endsAt", b.getEndsAt());
                    return row;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(events));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReports(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantIdHeader,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false) UUID staffId) {
        UUID tenantId = resolveTenant(tenantIdHeader);
        List<Booking> bookings;
        try {
            bookings = bookingRepository.findByTenantIdAndStartsAtBetween(
                    tenantId,
                    LocalDate.parse(startDate).atStartOfDay(WIB).toOffsetDateTime(),
                    LocalDate.parse(endDate).plusDays(1).atStartOfDay(WIB).toOffsetDateTime());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("startDate/endDate must be yyyy-MM-dd"));
        }
        Double avgRating = publicReviewRepository.averageRating(tenantId);
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalBookings", bookings.size());
        report.put("completedBookings", bookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count());
        report.put("cancelledBookings", bookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count());
        report.put("totalRevenue", sumRevenue(bookings));
        report.put("avgRating", avgRating == null ? 0.0 : Math.round(avgRating * 10.0) / 10.0);
        report.put("currency", "IDR");
        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSettings(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantIdHeader) {
        UUID tenantId = resolveTenant(tenantIdHeader);
        Map<String, Object> settings = defaultSettings(tenantId);
        configVersionRepository.findTopByConfigKeyOrderByVersionDesc(SETTINGS_PREFIX + tenantId)
                .ifPresent(config -> settings.putAll(config.getConfigValue()));
        return ResponseEntity.ok(ApiResponse.ok(settings));
    }

    @PutMapping("/settings")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateSettings(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantIdHeader,
            @RequestHeader(value = "X-Actor-Id", required = false) UUID actorHeader,
            @RequestBody Map<String, Object> request) {
        UUID tenantId = resolveTenant(tenantIdHeader);
        String key = SETTINGS_PREFIX + tenantId;
        int nextVersion = configVersionRepository.findTopByConfigKeyOrderByVersionDesc(key)
                .map(prev -> prev.getVersion() + 1)
                .orElse(1);
        ConfigVersion config = new ConfigVersion();
        config.setConfigKey(key);
        config.setConfigValue(new LinkedHashMap<>(request));
        config.setVersion(nextVersion);
        config.setCreatedBy(actorHeader != null ? actorHeader : tenantId);
        ConfigVersion saved = configVersionRepository.save(config);
        return ResponseEntity.ok(ApiResponse.ok(saved.getConfigValue(), "Settings updated"));
    }

    private UUID resolveTenant(UUID tenantIdHeader) {
        if (tenantIdHeader != null) {
            return tenantIdHeader;
        }
        return providerListingRepository.findAll().stream()
                .findFirst()
                .map(ProviderListing::getId)
                .orElseThrow(() -> new IllegalStateException("No tenant available"));
    }

    private Booking requireBooking(UUID tenantId, UUID id) {
        return bookingRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + id));
    }

    private BookingStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return BookingStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private List<Booking> countActive(List<Booking> bookings) {
        return bookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED && b.getStatus() != BookingStatus.EXPIRED)
                .collect(Collectors.toList());
    }

    private long sumRevenue(List<Booking> bookings) {
        return countActive(bookings).stream()
                .map(Booking::getTotal)
                .filter(Objects::nonNull)
                .mapToLong(BigDecimal::longValue)
                .sum();
    }

    private Map<String, Object> toBookingRow(Booking booking) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", booking.getId().toString());
        row.put("customerName", resolveCustomerName(booking.getCustomerId()));
        row.put("serviceName", "");
        row.put("status", booking.getStatus().name());
        row.put("time", booking.getStartsAt() != null
                ? booking.getStartsAt().atZoneSameInstant(WIB).format(DateTimeFormatter.ofPattern("HH:mm"))
                : null);
        row.put("amount", booking.getTotal() != null ? booking.getTotal().longValue() : 0L);
        row.put("bookingCode", booking.getBookingCode());
        return row;
    }

    private Map<String, Object> toServiceRow(ServiceOffering service) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", service.getId().toString());
        row.put("name", service.getName());
        row.put("description", service.getDescription());
        row.put("price", service.getPrice());
        row.put("duration", service.getDurationMinutes());
        row.put("currency", service.getCurrency());
        row.put("imageUrl", service.getImageUrl());
        row.put("active", Boolean.TRUE.equals(service.getIsActive()));
        return row;
    }

    private void applyServiceFields(ServiceOffering service, Map<String, Object> request) {
        if (request.containsKey("name")) {
            service.setName(Objects.toString(request.get("name"), null));
        }
        if (request.containsKey("description")) {
            service.setDescription(Objects.toString(request.get("description"), null));
        }
        if (request.containsKey("price")) {
            service.setPrice(toDecimal(request.get("price")));
        }
        if (request.containsKey("duration")) {
            service.setDurationMinutes(toInt(request.get("duration"), 30));
        }
        if (request.containsKey("currency")) {
            service.setCurrency(Objects.toString(request.get("currency"), "IDR"));
        }
        if (request.containsKey("imageUrl")) {
            service.setImageUrl(Objects.toString(request.get("imageUrl"), null));
        }
        if (request.containsKey("active")) {
            service.setIsActive(!Boolean.FALSE.equals(request.get("active")));
        } else if (service.getIsActive() == null) {
            service.setIsActive(true);
        }
    }

    private Map<String, Object> toCustomerRow(UUID customerId, List<Booking> bookings) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", customerId.toString());
        String name = null;
        String phone = null;
        String email = null;
        Optional<CustomerProfile> profile = customerProfileRepository.findById(customerId);
        if (profile.isPresent()) {
            name = profile.get().getNickname();
            Optional<User> user = userRepository.findById(profile.get().getUserId());
            if (user.isPresent()) {
                name = name != null ? name : user.get().getName();
                phone = user.get().getPhone();
                email = user.get().getEmail();
            }
        } else {
            Optional<User> user = userRepository.findById(customerId);
            if (user.isPresent()) {
                name = user.get().getName();
                phone = user.get().getPhone();
                email = user.get().getEmail();
            }
        }
        row.put("name", name != null ? name : customerId.toString());
        row.put("phone", phone);
        row.put("email", email);
        row.put("totalBookings", bookings.size());
        row.put("totalSpent", bookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .map(b -> b.getTotal() == null ? BigDecimal.ZERO : b.getTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        row.put("lastVisit", bookings.stream()
                .map(Booking::getStartsAt)
                .filter(Objects::nonNull)
                .max(OffsetDateTime::compareTo)
                .orElse(null));
        return row;
    }

    private Map<String, Object> defaultSettings(UUID tenantId) {
        Map<String, Object> settings = new LinkedHashMap<>();
        settings.put("businessName", providerListingRepository.findById(tenantId)
                .map(ProviderListing::getName)
                .orElse(""));
        settings.put("currency", "IDR");
        settings.put("timezone", WIB.getId());
        settings.put("bookingEnabled", true);
        return settings;
    }

    private String resolveCustomerName(UUID customerId) {
        if (customerId == null) {
            return "";
        }
        Optional<CustomerProfile> profile = customerProfileRepository.findById(customerId);
        if (profile.isPresent()) {
            Optional<User> user = userRepository.findById(profile.get().getUserId());
            if (user.isPresent()) {
                return profile.get().getNickname() != null ? profile.get().getNickname() : user.get().getName();
            }
        }
        return userRepository.findById(customerId)
                .map(User::getName)
                .orElse(customerId.toString());
    }

    private Integer toInt(Object value, int fallback) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(Objects.toString(value));
        } catch (Exception e) {
            return fallback;
        }
    }

    private BigDecimal toDecimal(Object value) {
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        try {
            return new BigDecimal(Objects.toString(value));
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private boolean contains(Object value, String lowerNeedle) {
        return value != null && value.toString().toLowerCase(Locale.ROOT).contains(lowerNeedle);
    }
}
