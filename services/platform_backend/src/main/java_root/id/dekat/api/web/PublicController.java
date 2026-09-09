package id.dekat.api.web;

import id.dekat.booking.domain.Booking;
import id.dekat.booking.domain.BookingRepository;
import id.dekat.booking.domain.BookingStatus;
import id.dekat.booking.domain.ServiceMode;
import id.dekat.catalog.domain.CategoryRepository;
import id.dekat.catalog.domain.ServiceOffering;
import id.dekat.catalog.domain.ServiceOfferingRepository;
import id.dekat.customer.domain.CustomerProfile;
import id.dekat.customer.domain.CustomerProfileRepository;
import id.dekat.identity.domain.User;
import id.dekat.identity.domain.UserRepository;
import id.dekat.media.domain.MediaRepository;
import id.dekat.review.domain.PublicReview;
import id.dekat.review.domain.PublicReviewRepository;
import id.dekat.review.domain.ReviewPhotoRepository;
import id.dekat.sharedkernel.web.ApiResponse;
import id.dekat.staff.application.StaffService;
import id.dekat.tenant.domain.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/public")
@Tag(name = "Public", description = "Endpoint publik - tidak perlu autentikasi")
public class PublicController {

    private static final ZoneId WIB = ZoneId.of("Asia/Jakarta");
    private static final List<BookingStatus> ACTIVE_STATUSES = List.of(
            BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.EN_ROUTE,
            BookingStatus.IN_SERVICE, BookingStatus.PENDING_APPROVAL, BookingStatus.HELD);

    private final CategoryRepository categoryRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final ProviderListingRepository providerListingRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final ProviderLocationRepository providerLocationRepository;
    private final StaffService staffService;
    private final PublicReviewRepository publicReviewRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final BlockedDateRepository blockedDateRepository;
    private final MediaRepository mediaRepository;
    private final ReviewPhotoRepository reviewPhotoRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public PublicController(CategoryRepository categoryRepository,
                            ServiceOfferingRepository serviceOfferingRepository,
                            ProviderListingRepository providerListingRepository,
                            BusinessProfileRepository businessProfileRepository,
                            ProviderLocationRepository providerLocationRepository,
                            StaffService staffService,
                            PublicReviewRepository publicReviewRepository,
                            CustomerProfileRepository customerProfileRepository,
                            UserRepository userRepository,
                            BookingRepository bookingRepository,
                            BlockedDateRepository blockedDateRepository,
                            MediaRepository mediaRepository,
                            ReviewPhotoRepository reviewPhotoRepository) {
        this.categoryRepository = categoryRepository;
        this.serviceOfferingRepository = serviceOfferingRepository;
        this.providerListingRepository = providerListingRepository;
        this.businessProfileRepository = businessProfileRepository;
        this.providerLocationRepository = providerLocationRepository;
        this.staffService = staffService;
        this.publicReviewRepository = publicReviewRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.blockedDateRepository = blockedDateRepository;
        this.mediaRepository = mediaRepository;
        this.reviewPhotoRepository = reviewPhotoRepository;
    }

    @GetMapping("/categories")
    @Operation(summary = "Daftar kategori layanan", description = "Mendapatkan semua kategori yang aktif")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCategories() {
        List<Map<String, Object>> categories = categoryRepository.findAllByIsActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(c -> {
                    Map<String, Object> row = new LinkedHashMap<String, Object>();
                    row.put("id", c.getId().toString());
                    row.put("name", c.getName());
                    row.put("icon", c.getIconUrl());
                    row.put("serviceCount", serviceOfferingRepository.countByCategoryIdAndIsActiveTrue(c.getId()));
                    return row;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @GetMapping("/providers")
    @Operation(summary = "Cari provider", description = "Mencari provider berdasarkan kata kunci, kategori, lokasi, harga, rating")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchProviders(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "name") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        List<Map<String, Object>> enriched = providerListingRepository.findAll().stream()
                .map(this::toProviderRow)
                .filter(row -> matchesQuery(row, q))
                .filter(row -> matchesCategory(row, category))
                .filter(row -> matchesCity(row, location))
                .filter(row -> minRating == null || ((Number) row.get("rating")).doubleValue() >= minRating)
                .filter(row -> matchesPrice(row, minPrice, maxPrice))
                .collect(Collectors.toList());
        sortProviders(enriched, sort);
        List<Map<String, Object>> pageRows = slice(enriched, page, limit);
        return ResponseEntity.ok(ApiResponse.ok(pageRows));
    }

    @GetMapping("/providers/featured")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFeaturedProviders(
            @RequestParam(defaultValue = "5") int limit) {
        List<Map<String, Object>> providers = providerListingRepository.findAll().stream()
                .sorted(Comparator.comparing(ProviderListing::getVerifiedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(Math.max(1, limit))
                .map(this::toProviderRow)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(providers));
    }

    @GetMapping("/providers/{slug}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProviderBySlug(@PathVariable String slug) {
        Optional<ProviderListing> found = providerListingRepository.findBySlug(slug);
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Provider not found"));
        }
        ProviderListing listing = found.get();
        Map<String, Object> provider = toProviderRow(listing);
        businessProfileRepository.findByTenantId(listing.getId()).stream().findFirst().ifPresent(b -> {
            provider.put("description", b.getDescription());
            provider.put("email", b.getEmail());
            provider.put("websiteUrl", b.getWebsiteUrl());
        });
        List<Map<String, Object>> locations = providerLocationRepository.findByTenantIdAndIsActiveTrue(listing.getId())
                .stream()
                .map(l -> {
                    Map<String, Object> loc = new LinkedHashMap<String, Object>();
                    loc.put("id", l.getId().toString());
                    loc.put("name", l.getName());
                    loc.put("address", l.getAddressLine1());
                    loc.put("city", l.getCity());
                    loc.put("latitude", l.getLatitude());
                    loc.put("longitude", l.getLongitude());
                    loc.put("phone", l.getPhone());
                    loc.put("timezone", l.getTimezone());
                    return loc;
                })
                .collect(Collectors.toList());
        provider.put("locations", locations);
        provider.put("serviceCount", serviceOfferingRepository.findByTenantIdAndIsActiveTrue(listing.getId()).size());
        return ResponseEntity.ok(ApiResponse.ok(provider));
    }

    @GetMapping("/providers/{providerId}/services")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProviderServices(@PathVariable UUID providerId) {
        List<Map<String, Object>> services = serviceOfferingRepository.findByTenantIdAndIsActiveTrueOrderByNameAsc(providerId)
                .stream()
                .map(s -> {
                    Map<String, Object> row = new LinkedHashMap<String, Object>();
                    row.put("id", s.getId().toString());
                    row.put("name", s.getName());
                    row.put("description", s.getDescription());
                    row.put("price", s.getPrice());
                    row.put("duration", s.getDurationMinutes());
                    row.put("currency", s.getCurrency());
                    row.put("imageUrl", s.getImageUrl());
                    return row;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(services));
    }

    @GetMapping("/providers/{providerId}/staff")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProviderStaff(@PathVariable UUID providerId) {
        List<Map<String, Object>> staff = staffService.getActivePublicStaff(providerId)
                .stream()
                .map(s -> {
                    Map<String, Object> row = new LinkedHashMap<String, Object>();
                    row.put("id", s.getId().toString());
                    row.put("name", s.getDisplayName());
                    row.put("title", s.getTitle());
                    row.put("bio", s.getBio());
                    row.put("avatar", s.getAvatarUrl());
                    row.put("avatarUrl", s.getAvatarUrl());
                    // specialties: split specialties TEXT comma-separated into array
                    if (s.getSpecialties() != null && !s.getSpecialties().isBlank()) {
                        String raw = s.getSpecialties().trim();
                        List<String> specs;
                        if (raw.startsWith("[")) {
                            // try JSON-like array
                            specs = Arrays.stream(raw.replaceAll("[\\[\\]\"]", "").split(","))
                                    .map(String::trim).filter(v -> !v.isEmpty()).toList();
                        } else {
                            specs = Arrays.stream(raw.split(",")).map(String::trim).filter(v -> !v.isEmpty()).toList();
                        }
                        row.put("specialties", specs);
                    } else {
                        row.put("specialties", List.of());
                    }
                    // portfolio photos via media_assets
                    try {
                        var portfolio = mediaRepository.findByOwnerTypeAndOwnerIdOrderBySortOrderAsc("staff", s.getId());
                        List<Map<String, Object>> photos = portfolio.stream().map(m -> {
                            Map<String, Object> pr = new LinkedHashMap<>();
                            pr.put("id", m.getId().toString());
                            pr.put("url", m.getUrl());
                            pr.put("fileName", m.getFileName());
                            pr.put("sortOrder", m.getSortOrder());
                            return pr;
                        }).toList();
                        row.put("portfolio", photos);
                        row.put("portfolioCount", photos.size());
                    } catch (Exception e) {
                        row.put("portfolio", List.of());
                        row.put("portfolioCount", 0);
                    }
                    return row;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(staff));
    }

    @GetMapping("/providers/{providerId}/availability")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailability(
            @PathVariable UUID providerId,
            @RequestParam(required = false) UUID staffId,
            @RequestParam(required = false) UUID serviceId,
            @RequestParam String date) {
        LocalDate day;
        try {
            day = LocalDate.parse(date);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("date must be yyyy-MM-dd"));
        }
        OffsetDateTime dayStart = day.atStartOfDay(WIB).toOffsetDateTime();
        OffsetDateTime dayEnd = day.plusDays(1).atStartOfDay(WIB).toOffsetDateTime();
        List<Booking> dayBookings = staffId != null
                ? bookingRepository.findOverlappingBookingsForStaff(providerId, staffId, dayStart, dayEnd, ACTIVE_STATUSES)
                : bookingRepository.findOverlappingBookings(providerId, dayStart, dayEnd, ACTIVE_STATUSES);
        OffsetDateTime now = OffsetDateTime.now(WIB);
        List<Map<String, Object>> slots = new ArrayList<>();
        for (int hour = 9; hour < 17; hour++) {
            LocalTime time = LocalTime.of(hour, 0);
            OffsetDateTime slotStart = day.atTime(time).atZone(WIB).toOffsetDateTime();
            OffsetDateTime slotEnd = slotStart.plusHours(1);
            boolean available = dayBookings.stream().noneMatch(b ->
                    b.getStartsAt().isBefore(slotEnd) && b.getEndsAt().isAfter(slotStart));
            if (!slotStart.isAfter(now)) {
                available = false;
            }
            Map<String, Object> slot = new LinkedHashMap<>();
            slot.put("id", time.toString());
            slot.put("time", time.toString());
            slot.put("startTime", slotStart.toString());
            slot.put("endTime", slotEnd.toString());
            slot.put("available", available);
            slots.add(slot);
        }
        return ResponseEntity.ok(ApiResponse.ok(slots));
    }

    @GetMapping("/providers/{providerId}/reviews")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProviderReviews(
            @PathVariable UUID providerId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        var reviewsPage = publicReviewRepository.findByTenantIdAndStatusOrderByCreatedAtDesc(
                providerId, PublicReview.ReviewStatus.PUBLISHED,
                PageRequest.of(Math.max(0, page - 1), Math.max(1, limit)));
        List<Map<String, Object>> data = reviewsPage.getContent().stream()
                .map(r -> {
                    Map<String, Object> row = new LinkedHashMap<String, Object>();
                    row.put("id", r.getId().toString());
                    row.put("rating", r.getRating());
                    row.put("title", r.getTitle());
                    row.put("comment", r.getBody());
                    row.put("createdAt", r.getCreatedAt());
                    row.put("customerName", resolveCustomerName(r.getCustomerId(), null));
                    // verified_booking badge: check if booking exists with same customer and provider and status COMPLETED
                    boolean verified = false;
                    try {
                        if (r.getBookingId() != null) {
                            var bookingOpt = bookingRepository.findById(r.getBookingId());
                            if (bookingOpt.isPresent()) {
                                var b = bookingOpt.get();
                                verified = b.getCustomerId().equals(r.getCustomerId())
                                        && b.getTenantId().equals(providerId)
                                        && b.getStatus() == BookingStatus.COMPLETED;
                            }
                        }
                        // fallback: any completed booking for same customer+tenant
                        if (!verified) {
                            verified = bookingRepository.findByCustomerId(r.getCustomerId(), PageRequest.of(0, 5)).getContent().stream()
                                    .anyMatch(b -> b.getTenantId().equals(providerId) && b.getStatus() == BookingStatus.COMPLETED);
                        }
                    } catch (Exception ignored) {}
                    row.put("verifiedBooking", verified);
                    // photos: via media_assets owner_type=review or review_photos junction
                    try {
                        List<Map<String, Object>> photos = new ArrayList<>();
                        var linked = reviewPhotoRepository.findByReviewId(r.getId());
                        if (!linked.isEmpty()) {
                            List<UUID> mediaIds = linked.stream().map(id -> id.getMediaAssetId()).toList();
                            var assets = mediaRepository.findAllById(mediaIds);
                            for (var a : assets) {
                                Map<String, Object> pr = new LinkedHashMap<>();
                                pr.put("id", a.getId().toString());
                                pr.put("url", a.getUrl());
                                pr.put("fileName", a.getFileName());
                                photos.add(pr);
                            }
                        } else {
                            var assets = mediaRepository.findByOwnerTypeAndOwnerIdOrderBySortOrderAsc("review", r.getId());
                            for (var a : assets) {
                                Map<String, Object> pr = new LinkedHashMap<>();
                                pr.put("id", a.getId().toString());
                                pr.put("url", a.getUrl());
                                pr.put("fileName", a.getFileName());
                                photos.add(pr);
                            }
                        }
                        if (photos.size() > 8) photos = photos.subList(0, 8);
                        row.put("photos", photos);
                    } catch (Exception e) {
                        row.put("photos", List.of());
                    }
                    return row;
                })
                .collect(Collectors.toList());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("data", data);
        result.put("pagination", Map.of(
                "page", page,
                "limit", limit,
                "total", reviewsPage.getTotalElements(),
                "totalPages", reviewsPage.getTotalPages()));
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/providers/{providerId}/blocked-dates")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProviderBlockedDates(
            @PathVariable UUID providerId) {
        List<BlockedDate> dates = blockedDateRepository.findByTenantId(providerId);
        List<Map<String, Object>> result = dates.stream().map(d -> {
            Map<String, Object> row = new LinkedHashMap<String, Object>();
            row.put("date", d.getBlockedDate().toString());
            row.put("reason", d.getReason());
            return row;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/bookings")
    @Operation(summary = "Buat booking (guest)", description = "Membuat booking baru tanpa login. Customer email akan auto-create user jika belum ada.")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> createBooking(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID headerTenantId,
            @RequestParam(value = "userId", required = false) UUID userIdParam,
            @RequestBody Map<String, Object> request) {
        UUID tenantId = firstUuid(request.get("tenantId"), request.get("providerId"), headerTenantId);
        if (tenantId == null) {
            tenantId = providerListingRepository.findAll().stream().findFirst()
                    .map(ProviderListing::getId).orElse(null);
        }
        if (tenantId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("tenantId is required"));
        }
        UUID customerId = firstUuid(request.get("customerId"), userIdParam);
        if (customerId == null) {
            customerId = resolveGuestCustomer(request);
        }
        UUID locationId = firstUuid(request.get("locationId"));
        if (locationId == null) {
            locationId = providerLocationRepository.findByTenantIdAndIsActiveTrue(tenantId).stream()
                    .findFirst().map(ProviderLocation::getId).orElse(null);
        }
        if (customerId == null || locationId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("customerId and a resolvable location are required"));
        }
        OffsetDateTime startsAt = parseTime(request.get("startsAt"));
        OffsetDateTime endsAt = parseTime(request.get("endsAt"));
        if (startsAt == null) {
            String dateStr = Objects.toString(request.get("date"), null);
            String timeStr = Objects.toString(request.get("time"), "09:00");
            if (dateStr == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("startsAt or date is required"));
            }
            LocalDate day = LocalDate.parse(dateStr);
            LocalTime time = LocalTime.parse(timeStr.length() == 5 ? timeStr : timeStr.substring(0, 5));
            startsAt = day.atTime(time).atZone(WIB).toOffsetDateTime();
        }
        if (endsAt == null) {
            endsAt = startsAt.plusHours(1);
        }
        if (!bookingRepository.findOverlappingBookings(tenantId, startsAt, endsAt, ACTIVE_STATUSES).isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("Time slot not available"));
        }
        BigDecimal price = BigDecimal.ZERO;
        UUID serviceId = firstUuid(request.get("serviceId"));
        if (serviceId != null) {
            UUID scopeTenantId = tenantId;
            price = serviceOfferingRepository.findById(serviceId)
                    .filter(s -> s.getTenantId().equals(scopeTenantId))
                    .map(ServiceOffering::getPrice)
                    .orElse(BigDecimal.ZERO);
        }
        Booking booking = new Booking(tenantId, locationId, customerId, generateBookingCode(),
                ServiceMode.IN_PERSON, startsAt, endsAt, WIB, "IDR");
        booking.setSource("WEB");
        booking.setSubtotal(price);
        booking.setTotal(price);
        String pin = String.format("%06d", new java.util.Random().nextInt(999999));
        booking.setConfirmationPin(pin);
        Booking saved = bookingRepository.save(booking);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", saved.getId().toString());
        result.put("status", saved.getStatus().name());
        result.put("bookingCode", saved.getBookingCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(result, "Booking created"));
    }

    private Map<String, Object> toProviderRow(ProviderListing listing) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", listing.getId().toString());
        row.put("name", listing.getName());
        row.put("slug", listing.getSlug());
        Double rating = publicReviewRepository.averageRating(listing.getId());
        long reviewCount = publicReviewRepository.countByTenantIdAndStatus(listing.getId(), PublicReview.ReviewStatus.PUBLISHED);
        row.put("rating", rating == null ? 0.0 : Math.round(rating * 10.0) / 10.0);
        row.put("reviewCount", reviewCount);
        List<BusinessProfile> profiles = businessProfileRepository.findByTenantId(listing.getId());
        if (!profiles.isEmpty()) {
            BusinessProfile profile = profiles.get(0);
            row.put("category", profile.getIndustry());
            row.put("imageUrl", profile.getLogoUrl() != null ? profile.getLogoUrl() : profile.getBannerUrl());
        } else {
            row.put("category", null);
            row.put("imageUrl", listing.getLogoUrl());
        }
        List<ProviderLocation> locations = providerLocationRepository.findByTenantIdAndIsActiveTrue(listing.getId());
        if (!locations.isEmpty()) {
            ProviderLocation location = locations.get(0);
            row.put("city", location.getCity());
            row.put("address", location.getAddressLine1());
            row.put("minPrice", serviceOfferingRepository.findByTenantIdAndIsActiveTrue(listing.getId()).stream()
                    .map(ServiceOffering::getPrice)
                    .min(BigDecimal::compareTo)
                    .orElse(null));
        } else {
            row.put("city", null);
            row.put("address", null);
            row.put("minPrice", null);
        }
        return row;
    }

    private boolean matchesQuery(Map<String, Object> row, String q) {
        if (q == null || q.isBlank()) {
            return true;
        }
        String needle = q.toLowerCase(Locale.ROOT);
        return contains(row.get("name"), needle) || contains(row.get("slug"), needle);
    }

    private boolean matchesCategory(Map<String, Object> row, String category) {
        if (category == null || category.isBlank()) {
            return true;
        }
        return contains(row.get("category"), category.toLowerCase(Locale.ROOT));
    }

    private boolean matchesCity(Map<String, Object> row, String city) {
        if (city == null || city.isBlank()) {
            return true;
        }
        return contains(row.get("city"), city.toLowerCase(Locale.ROOT));
    }

    private boolean matchesPrice(Map<String, Object> row, BigDecimal minPrice, BigDecimal maxPrice) {
        Object raw = row.get("minPrice");
        if (!(raw instanceof BigDecimal min)) {
            return true;
        }
        if (minPrice != null && min.compareTo(minPrice) < 0) {
            return false;
        }
        return maxPrice == null || min.compareTo(maxPrice) <= 0;
    }

    private boolean contains(Object value, String lowerNeedle) {
        return value != null && value.toString().toLowerCase(Locale.ROOT).contains(lowerNeedle);
    }

    private void sortProviders(List<Map<String, Object>> rows, String sort) {
        boolean desc = sort.startsWith("-");
        String key = desc ? sort.substring(1) : sort;
        Comparator<Map<String, Object>> comparator;
        switch (key) {
            case "rating" -> comparator = Comparator.comparingDouble(r -> ((Number) r.getOrDefault("rating", 0)).doubleValue());
            case "price" -> comparator = Comparator.comparing(r -> (BigDecimal) r.getOrDefault("minPrice", null),
                    Comparator.nullsLast(Comparator.naturalOrder()));
            default -> comparator = Comparator.comparing(r -> Objects.toString(r.get("name"), ""), String.CASE_INSENSITIVE_ORDER);
        }
        if (desc) {
            comparator = comparator.reversed();
        }
        rows.sort(comparator);
    }

    private List<Map<String, Object>> slice(List<Map<String, Object>> rows, int page, int limit) {
        int safeLimit = Math.max(1, limit);
        int safePage = Math.max(1, page);
        int fromIndex = Math.min((safePage - 1) * safeLimit, rows.size());
        int toIndex = Math.min(fromIndex + safeLimit, rows.size());
        return rows.subList(fromIndex, toIndex);
    }

    private String resolveCustomerName(UUID customerId, String fallback) {
        if (customerId == null) {
            return fallback;
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
                .orElse(fallback != null ? fallback : customerId.toString());
    }

    private OffsetDateTime parseTime(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return OffsetDateTime.parse(value.toString());
        } catch (Exception e) {
            return null;
        }
    }

    private String generateBookingCode() {
        for (int attempt = 0; attempt < 10; attempt++) {
            String code = "DKT-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase(Locale.ROOT);
            if (bookingRepository.findByBookingCode(code).isEmpty()) {
                return code;
            }
        }
        throw new IllegalStateException("Unable to generate unique booking code");
    }

    private UUID firstUuid(Object... candidates) {
        for (Object candidate : candidates) {
            if (candidate instanceof UUID uuid) {
                return uuid;
            }
            if (candidate != null) {
                try {
                    return UUID.fromString(candidate.toString());
                } catch (IllegalArgumentException ignored) {
                }
            }
        }
        return null;
    }

    private UUID resolveGuestCustomer(Map<String, Object> request) {
        String email = Objects.toString(request.get("customerEmail"), null);
        if (email == null || email.isBlank()) {
            return null;
        }
        List<?> existing = entityManager.createNativeQuery(
                        "SELECT id FROM users WHERE LOWER(email) = LOWER(:email)")
                .setParameter("email", email)
                .getResultList();
        if (!existing.isEmpty()) {
            return (UUID) existing.get(0);
        }
        UUID newId = UUID.randomUUID();
        String name = Objects.toString(request.get("customerName"), "Guest");
        Object phone = request.get("customerPhone");
        entityManager.createNativeQuery(
                        "INSERT INTO users (id, email, phone, name, status) VALUES (:id, :email, :phone, :name, 'PENDING_VERIFICATION')")
                .setParameter("id", newId)
                .setParameter("email", email)
                .setParameter("phone", phone == null ? null : phone.toString())
                .setParameter("name", name)
                .executeUpdate();
        return newId;
    }

    @GetMapping("/providers/nearby")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> findNearbyProviders(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radiusKm,
            @RequestParam(defaultValue = "20") int limit) {

        // Haversine formula for distance calculation
        String haversine = "(6371 * acos(cos(radians(:lat)) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(l.latitude))))";
        
        List<Object[]> results = entityManager.createNativeQuery(
            "SELECT sub.id, sub.name, sub.slug, sub.verification_status, sub.distance FROM (" +
            "SELECT t.id, t.name, t.slug, t.verification_status, " +
            haversine + " AS distance " +
            "FROM tenants t " +
            "JOIN locations l ON l.tenant_id = t.id " +
            "WHERE t.verification_status = 'VERIFIED'" +
            ") sub " +
            "WHERE sub.distance <= :radius " +
            "ORDER BY sub.distance " +
            "LIMIT :limit")
            .setParameter("lat", lat)
            .setParameter("lng", lng)
            .setParameter("radius", radiusKm)
            .setParameter("limit", limit)
            .getResultList();

        List<Map<String, Object>> providers = results.stream().map(row -> {
            Object[] arr = (Object[]) row;
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", arr[0].toString());
            map.put("name", arr[1]);
            map.put("slug", arr[2]);
            map.put("verificationStatus", arr[3]);
            map.put("distanceKm", arr[4]);
            return map;
        }).toList();

        return ResponseEntity.ok(ApiResponse.ok(providers));
    }
}
