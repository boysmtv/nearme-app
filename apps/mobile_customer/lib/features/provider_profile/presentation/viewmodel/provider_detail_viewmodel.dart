import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/provider_entity.dart';
import '../../domain/entities/service_entity.dart';
import '../../domain/entities/staff_entity.dart';
import '../../../../core/di/providers.dart';
import '../../data/repositories/provider_repository_impl.dart';

final providerDetailProvider =
    FutureProvider.autoDispose.family<ProviderEntity, String>((ref, slug) async {
  final repo = ProviderRepositoryImpl(ref.read(apiServiceProvider));
  final result = await repo.getProvider(slug);
  return result.fold((l) => throw Exception(l.message), (r) => r);
});

final providerServicesProvider =
    FutureProvider.autoDispose.family<List<ServiceEntity>, String>((ref, providerId) async {
  final repo = ProviderRepositoryImpl(ref.read(apiServiceProvider));
  final result = await repo.getProviderServices(providerId);
  return result.fold((l) => throw Exception(l.message), (r) => r);
});

final providerGalleryProvider =
    FutureProvider.autoDispose.family<List<Map<String, dynamic>>, String>((ref, providerId) async {
  final repo = ProviderRepositoryImpl(ref.read(apiServiceProvider));
  final result = await repo.getProviderMedia(providerId);
  return result.fold((l) => throw Exception(l.message), (r) => r);
});

final providerStaffWithPortfolioProvider =
    FutureProvider.autoDispose.family<List<StaffEntity>, String>((ref, providerId) async {
  final repo = ProviderRepositoryImpl(ref.read(apiServiceProvider));
  final result = await repo.getProviderStaff(providerId);
  return result.fold((l) => throw Exception(l.message), (r) => r);
});
