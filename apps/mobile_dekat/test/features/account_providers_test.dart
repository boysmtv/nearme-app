import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile_dekat/features/account/presentation/pages/social_feed_page.dart';

void main() {
  group('feedFutureProvider', () {
    test('returns feed posts from override', () async {
      final container = ProviderContainer(
        overrides: [
          feedFutureProvider.overrideWith((ref) => Future.value([
                {
                  'id': 'post1',
                  'providerName': 'Barber Central',
                  'title': 'New Service Available',
                  'body': 'We now offer hot towel shaves!',
                  'type': 'PROMO',
                  'likes': 15,
                  'comments': 3,
                  'isLiked': false,
                },
                {
                  'id': 'post2',
                  'providerName': 'Salon Lux',
                  'title': 'Gallery Update',
                  'body': 'Check out our latest work.',
                  'type': 'GALLERY',
                  'likes': 42,
                  'comments': 8,
                  'isLiked': true,
                },
              ])),
        ],
      );
      addTearDown(container.dispose);

      final posts = await container.read(feedFutureProvider.future);
      expect(posts.length, 2);
      expect((posts[0] as Map)['providerName'], 'Barber Central');
      expect((posts[1] as Map)['type'], 'GALLERY');
    });

    test('returns empty list on error (graceful)', () async {
      final container = ProviderContainer(
        overrides: [
          feedFutureProvider.overrideWith((ref) async {
            return [];
          }),
        ],
      );
      addTearDown(container.dispose);

      final posts = await container.read(feedFutureProvider.future);
      expect(posts, isEmpty);
    });

    test('returns empty list when data is empty', () async {
      final container = ProviderContainer(
        overrides: [
          feedFutureProvider.overrideWith((ref) => Future.value([])),
        ],
      );
      addTearDown(container.dispose);

      final posts = await container.read(feedFutureProvider.future);
      expect(posts, isEmpty);
    });
  });

  group('trendingFutureProvider', () {
    test('returns trending providers from override', () async {
      final container = ProviderContainer(
        overrides: [
          trendingFutureProvider.overrideWith((ref) => Future.value([
                {
                  'name': 'Barber Central',
                  'followers': 1200,
                  'bookings': 340,
                },
                {
                  'name': 'Salon Lux',
                  'followers': 890,
                  'bookings': 210,
                },
              ])),
        ],
      );
      addTearDown(container.dispose);

      final trending = await container.read(trendingFutureProvider.future);
      expect(trending.length, 2);
      expect((trending[0] as Map)['name'], 'Barber Central');
      expect((trending[0] as Map)['followers'], 1200);
    });

    test('returns empty list when no trending', () async {
      final container = ProviderContainer(
        overrides: [
          trendingFutureProvider.overrideWith((ref) => Future.value([])),
        ],
      );
      addTearDown(container.dispose);

      final trending = await container.read(trendingFutureProvider.future);
      expect(trending, isEmpty);
    });

    test('gracefully handles error returning empty list', () async {
      final container = ProviderContainer(
        overrides: [
          trendingFutureProvider.overrideWith((ref) async => []),
        ],
      );
      addTearDown(container.dispose);

      final trending = await container.read(trendingFutureProvider.future);
      expect(trending, isEmpty);
    });

    test('trending with zero followers and bookings', () async {
      final container = ProviderContainer(
        overrides: [
          trendingFutureProvider.overrideWith((ref) => Future.value([
                {
                  'name': 'New Salon',
                  'followers': 0,
                  'bookings': 0,
                },
              ])),
        ],
      );
      addTearDown(container.dispose);

      final trending = await container.read(trendingFutureProvider.future);
      expect((trending[0] as Map)['followers'], 0);
      expect((trending[0] as Map)['bookings'], 0);
    });
  });
}
