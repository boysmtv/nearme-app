import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/booking_entity.dart';
import '../../../provider_profile/domain/entities/service_entity.dart';
import '../../../../core/di/providers.dart';
import '../../data/repositories/booking_repository_impl.dart';
import '../../../shared/data/models/dto.dart';

enum BookingFilter { all, pending, confirmed, completed, cancelled }

final bookingFilterProvider = StateProvider<BookingFilter>((ref) => BookingFilter.all);

final bookingsProvider = FutureProvider<List<BookingEntity>>((ref) async {
  final filter = ref.watch(bookingFilterProvider);
  final params = <String, dynamic>{'page': 1, 'limit': 50};
  if (filter != BookingFilter.all) params['status'] = filter.name.toUpperCase();
  final repo = BookingRepositoryImpl(ref.read(apiServiceProvider));
  final result = await repo.getBookings(params: params);
  return result.fold((l) => throw Exception(l.message), (r) => r);
});

final bookingDetailProvider2 = FutureProvider.autoDispose.family<BookingEntity, String>((ref, id) async {
  final repo = BookingRepositoryImpl(ref.read(apiServiceProvider));
  final result = await repo.getBooking(id);
  return result.fold((l) => throw Exception(l.message), (r) => r);
});

class BookingSummary {
  final ServiceEntity service;
  final String providerName;
  final String? staffName;
  const BookingSummary({required this.service, required this.providerName, this.staffName});
}

final bookingSummaryProvider =
    FutureProvider.autoDispose.family<BookingSummary, String>((ref, key) async {
  final parts = key.split('|');
  final providerId = parts[0];
  final serviceId = parts.length > 1 ? parts[1] : '';
  final staffId = parts.length > 2 ? parts[2] : null;

  // Services & staff independen (keduanya hanya butuh providerId) → jalan paralel.
  // Jangan await berurutan: hemat ~1 RTT di halaman ringkasan booking.
  final api = ref.read(apiServiceProvider);
  final results = await Future.wait([
    api.getProviderServices(providerId),
    if (staffId != null && staffId.isNotEmpty) api.getProviderStaff(providerId),
  ]);
  final servicesRes = results[0];
  final services = ((servicesRes.data['data'] ?? []) as List)
      .map((e) => ServiceDto.fromJson(e as Map<String, dynamic>))
      .toList();
  final service = services.firstWhere(
    (s) => s.id == serviceId,
    orElse: () => throw Exception('Selected service not found'),
  );

  String? staffName;
  if (staffId != null && staffId.isNotEmpty && results.length > 1) {
    try {
      final staffRes = results[1];
      final staffList = ((staffRes.data['data'] ?? []) as List).cast<Map<String, dynamic>>();
      final match = staffList.where((s) => s['id'] == staffId);
      if (match.isNotEmpty) {
        staffName = match.first['displayName'] as String? ?? match.first['name'] as String?;
      }
    } catch (_) {}
  }
  return BookingSummary(service: service, providerName: 'Provider', staffName: staffName);
});

final bookingConfirmationProvider =
    FutureProvider.autoDispose.family<BookingEntity, String>((ref, id) async {
  final repo = BookingRepositoryImpl(ref.read(apiServiceProvider));
  final result = await repo.getBooking(id);
  return result.fold((l) => throw Exception(l.message), (r) => r);
});
