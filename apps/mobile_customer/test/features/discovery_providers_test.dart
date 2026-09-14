import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:mobile_customer/shared/models/rows.dart';

import 'package:mobile_customer/features/discovery/providers/discovery_providers.dart';

class FakeDiscoveryNotifier extends DiscoveryProvidersNotifier {
  List<ProviderRow> _result = [];
  Object? _error;

  void setResult(List<ProviderRow> data) => _result = data;
  void setError(Object e) => _error = e;

  @override
  Future<List<ProviderRow>> build() async {
    if (_error != null) throw _error!;
    return _result;
  }
}

class FakeCategoriesNotifier extends CategoriesNotifier {
  List<Category> _result = [];
  Object? _error;

  void setResult(List<Category> data) => _result = data;
  void setError(Object e) => _error = e;

  @override
  Future<List<Category>> build() async {
    if (_error != null) throw _error!;
    return _result;
  }
}

void main() {
  group('discoveryProvidersProvider', () {
    test('returns list of providers', () async {
      final fake = FakeDiscoveryNotifier()
        ..setResult([
          const ProviderRow(id: '1', slug: 's1', name: 'Provider 1', rating: 4.5, reviewCount: 10),
          const ProviderRow(id: '2', slug: 's2', name: 'Provider 2', rating: 3.0, reviewCount: 5),
        ]);

      final container = ProviderContainer(
        overrides: [
          discoveryProvidersProvider.overrideWith(() => fake),
        ],
      );
      addTearDown(container.dispose);

      final providers = await container.read(discoveryProvidersProvider.future);
      expect(providers.length, 2);
      expect(providers[0].name, 'Provider 1');
      expect(providers[1].name, 'Provider 2');
    });

    test('returns empty list when no providers', () async {
      final fake = FakeDiscoveryNotifier()..setResult([]);

      final container = ProviderContainer(
        overrides: [
          discoveryProvidersProvider.overrideWith(() => fake),
        ],
      );
      addTearDown(container.dispose);

      final providers = await container.read(discoveryProvidersProvider.future);
      expect(providers, isEmpty);
    });

    test('propagates error', () async {
      final fake = FakeDiscoveryNotifier()
        ..setError(Exception('Network error'));

      final container = ProviderContainer(
        overrides: [
          discoveryProvidersProvider.overrideWith(() => fake),
        ],
      );
      addTearDown(container.dispose);

      expect(
        () => container.read(discoveryProvidersProvider.future),
        throwsA(isA<Exception>()),
      );
    });
  });

  group('categoriesProvider', () {
    test('returns list of categories', () async {
      final fake = FakeCategoriesNotifier()
        ..setResult([
          const Category(id: '1', name: 'Barbershop', icon: 'scissors'),
          const Category(id: '2', name: 'Salon', icon: 'spa'),
        ]);

      final container = ProviderContainer(
        overrides: [
          categoriesProvider.overrideWith(() => fake),
        ],
      );
      addTearDown(container.dispose);

      final categories = await container.read(categoriesProvider.future);
      expect(categories.length, 2);
      expect(categories[0].name, 'Barbershop');
      expect(categories[1].name, 'Salon');
    });

    test('returns empty list when no categories', () async {
      final fake = FakeCategoriesNotifier()..setResult([]);

      final container = ProviderContainer(
        overrides: [
          categoriesProvider.overrideWith(() => fake),
        ],
      );
      addTearDown(container.dispose);

      final categories = await container.read(categoriesProvider.future);
      expect(categories, isEmpty);
    });

    test('propagates error', () async {
      final fake = FakeCategoriesNotifier()
        ..setError(Exception('Fetch failed'));

      final container = ProviderContainer(
        overrides: [
          categoriesProvider.overrideWith(() => fake),
        ],
      );
      addTearDown(container.dispose);

      expect(
        () => container.read(categoriesProvider.future),
        throwsA(isA<Exception>()),
      );
    });
  });

  group('dashboardProfileProvider', () {
    test('returns empty map when override returns empty', () async {
      final container = ProviderContainer(
        overrides: [
          dashboardProfileProvider.overrideWith((ref) async => {}),
        ],
      );
      addTearDown(container.dispose);

      final result = await container.read(dashboardProfileProvider.future);
      expect(result, isEmpty);
    });

    test('returns profile data from override', () async {
      final container = ProviderContainer(
        overrides: [
          dashboardProfileProvider.overrideWith((ref) async => {
                'name': 'Siti',
                'email': 'siti@gmail.com',
                'phone': '08123456789',
              }),
        ],
      );
      addTearDown(container.dispose);

      final result = await container.read(dashboardProfileProvider.future);
      expect(result['name'], 'Siti');
      expect(result['email'], 'siti@gmail.com');
    });

    test('returns empty map when data has no data key', () async {
      final container = ProviderContainer(
        overrides: [
          dashboardProfileProvider.overrideWith((ref) async => {}),
        ],
      );
      addTearDown(container.dispose);

      final result = await container.read(dashboardProfileProvider.future);
      expect(result, isEmpty);
    });
  });
}
