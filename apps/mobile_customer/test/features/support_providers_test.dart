import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_customer/shared/models/rows.dart';

import 'package:mobile_customer/features/support/presentation/pages/support_page.dart';

void main() {
  group('faqsProvider', () {
    test('returns list of FAQs from override', () async {
      final container = ProviderContainer(
        overrides: [
          faqsProvider.overrideWith((ref) => Future.value([
                const FaqRow(
                  id: 'f1',
                  question: 'How to cancel a booking?',
                  answer: 'You can cancel up to 24 hours before.',
                  category: 'booking',
                ),
                const FaqRow(
                  id: 'f2',
                  question: 'What payment methods are accepted?',
                  answer: 'Cash, E-Wallet, Bank Transfer.',
                  category: 'payment',
                ),
              ])),
        ],
      );
      addTearDown(container.dispose);

      final faqs = await container.read(faqsProvider.future);
      expect(faqs.length, 2);
      expect(faqs[0].question, 'How to cancel a booking?');
      expect(faqs[0].category, 'booking');
      expect(faqs[1].category, 'payment');
    });

    test('returns empty list when no FAQs', () async {
      final container = ProviderContainer(
        overrides: [
          faqsProvider.overrideWith((ref) => Future.value(<FaqRow>[])),
        ],
      );
      addTearDown(container.dispose);

      final faqs = await container.read(faqsProvider.future);
      expect(faqs, isEmpty);
    });

    test('propagates error from API', () async {
      final container = ProviderContainer(
        overrides: [
          faqsProvider.overrideWith(
              (ref) => Future.error(Exception('Server error'))),
        ],
      );
      addTearDown(container.dispose);

      expect(
        () => container.read(faqsProvider.future),
        throwsA(isA<Exception>()),
      );
    });

    test('FAQ with null category is handled', () async {
      final container = ProviderContainer(
        overrides: [
          faqsProvider.overrideWith((ref) => Future.value([
                const FaqRow(
                  id: 'f3',
                  question: 'General question',
                  answer: 'General answer',
                ),
              ])),
        ],
      );
      addTearDown(container.dispose);

      final faqs = await container.read(faqsProvider.future);
      expect(faqs[0].category, isNull);
    });
  });

  group('policiesProvider', () {
    test('returns list of policies from override', () async {
      final container = ProviderContainer(
        overrides: [
          policiesProvider.overrideWith((ref) => Future.value([
                const PolicyRow(
                  id: 'p1',
                  title: 'Cancellation Policy',
                  body: 'Full refund within 24 hours.',
                  type: 'cancellation',
                ),
                const PolicyRow(
                  id: 'p2',
                  title: 'Deposit Policy',
                  body: 'Deposit is non-refundable after service.',
                  type: 'deposit',
                ),
              ])),
        ],
      );
      addTearDown(container.dispose);

      final policies = await container.read(policiesProvider.future);
      expect(policies.length, 2);
      expect(policies[0].title, 'Cancellation Policy');
      expect(policies[1].type, 'deposit');
    });

    test('returns empty list when no policies', () async {
      final container = ProviderContainer(
        overrides: [
          policiesProvider.overrideWith((ref) => Future.value(<PolicyRow>[])),
        ],
      );
      addTearDown(container.dispose);

      final policies = await container.read(policiesProvider.future);
      expect(policies, isEmpty);
    });

    test('propagates error from API', () async {
      final container = ProviderContainer(
        overrides: [
          policiesProvider.overrideWith(
              (ref) => Future.error(Exception('Timeout'))),
        ],
      );
      addTearDown(container.dispose);

      expect(
        () => container.read(policiesProvider.future),
        throwsA(isA<Exception>()),
      );
    });
  });
}
