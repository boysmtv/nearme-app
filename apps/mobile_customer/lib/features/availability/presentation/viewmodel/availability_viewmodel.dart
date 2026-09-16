import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/slot_entity.dart';
import '../../../provider_profile/domain/entities/service_entity.dart';
import '../../../provider_profile/domain/entities/staff_entity.dart';
import '../../../../core/di/providers.dart';
import '../../data/repositories/availability_repository_impl.dart';

final selectedDateProvider = StateProvider<DateTime>((ref) => DateTime.now());
final selectedTimeSlotProvider = StateProvider<String?>((ref) => null);
final selectedStaffIdProvider = StateProvider<String?>((ref) => null);

final availabilityProvider =
    FutureProvider.autoDispose.family<List<SlotEntity>, String>((ref, key) async {
  final parts = key.split('|');
  final providerId = parts[0];
  final date = parts[1];
  final staffId = parts.length > 2 ? parts[2] : null;
  final repo = AvailabilityRepositoryImpl(ref.read(apiServiceProvider));
  final result = await repo.getAvailability(providerId, date, staffId: staffId);
  return result.fold((l) => throw Exception(l.message), (r) => r);
});

final bookingServicesProvider =
    FutureProvider.autoDispose.family<List<ServiceEntity>, String>((ref, providerId) async {
  final repo = AvailabilityRepositoryImpl(ref.read(apiServiceProvider));
  final result = await repo.getProviderServices(providerId);
  return result.fold((l) => throw Exception(l.message), (r) => r);
});

final providerStaffProvider =
    FutureProvider.autoDispose.family<List<StaffEntity>, String>((ref, providerId) async {
  final repo = AvailabilityRepositoryImpl(ref.read(apiServiceProvider));
  final result = await repo.getProviderStaff(providerId);
  return result.fold((l) => throw Exception(l.message), (r) => r);
});
