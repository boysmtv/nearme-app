import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

class NotificationPreference {
  final String type;
  final String label;
  final String description;
  final bool email;
  final bool push;
  final bool inApp;

  NotificationPreference({
    required this.type,
    required this.label,
    required this.description,
    this.email = true,
    this.push = true,
    this.inApp = true,
  });

  NotificationPreference copyWith({bool? email, bool? push, bool? inApp}) {
    return NotificationPreference(
      type: type,
      label: label,
      description: description,
      email: email ?? this.email,
      push: push ?? this.push,
      inApp: inApp ?? this.inApp,
    );
  }
}

final notificationPrefsProvider = StateProvider<List<NotificationPreference>>((ref) {
  return [
    NotificationPreference(type: 'BOOKING_CONFIRMED', label: 'Booking Dikonfirmasi', description: 'Saat booking dikonfirmasi provider'),
    NotificationPreference(type: 'BOOKING_REMINDER', label: 'Pengingat Booking', description: 'Pengingat H-24 dan H-2'),
    NotificationPreference(type: 'BOOKING_CANCELLED', label: 'Booking Dibatalkan', description: 'Saat booking dibatalkan'),
    NotificationPreference(type: 'PAYMENT_SUCCESS', label: 'Pembayaran Berhasil', description: 'Konfirmasi pembayaran'),
    NotificationPreference(type: 'PROMO', label: 'Promo & Diskon', description: 'Info promo spesial'),
    NotificationPreference(type: 'REVIEW_REMINDER', label: 'Pengingat Ulasan', description: 'Minta ulasan setelah selesai'),
    NotificationPreference(type: 'LOYALTY_POINTS', label: 'Poin Loyalty', description: 'Update poin dan reward'),
    NotificationPreference(type: 'NEWSLETTER', label: 'Newsletter', description: 'Tips kecantikan'),
  ];
});

class _PrefGroup {
  final String title;
  final String subtitle;
  final IconData icon;
  final List<String> types;

  const _PrefGroup({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.types,
  });
}

const _prefGroups = [
  _PrefGroup(
    title: 'Booking',
    subtitle: 'Status dan pengingat jadwal Anda',
    icon: Icons.calendar_month_outlined,
    types: ['BOOKING_CONFIRMED', 'BOOKING_REMINDER', 'BOOKING_CANCELLED'],
  ),
  _PrefGroup(
    title: 'Pembayaran & Poin',
    subtitle: 'Transaksi dan reward loyalty',
    icon: Icons.wallet_outlined,
    types: ['PAYMENT_SUCCESS', 'LOYALTY_POINTS'],
  ),
  _PrefGroup(
    title: 'Promo & Info',
    subtitle: 'Penawaran spesial dan kabar terbaru',
    icon: Icons.campaign_outlined,
    types: ['PROMO', 'REVIEW_REMINDER', 'NEWSLETTER'],
  ),
];

IconData _iconForType(String type) {
  switch (type) {
    case 'BOOKING_CONFIRMED':
      return Icons.check_circle_outline;
    case 'BOOKING_REMINDER':
      return Icons.alarm_outlined;
    case 'BOOKING_CANCELLED':
      return Icons.cancel_outlined;
    case 'PAYMENT_SUCCESS':
      return Icons.payments_outlined;
    case 'PROMO':
      return Icons.percent_rounded;
    case 'REVIEW_REMINDER':
      return Icons.star_border_rounded;
    case 'LOYALTY_POINTS':
      return Icons.stars_outlined;
    case 'NEWSLETTER':
      return Icons.mail_outline;
    default:
      return Icons.notifications_outlined;
  }
}

Color _colorForType(String type) {
  switch (type) {
    case 'BOOKING_CONFIRMED':
    case 'PAYMENT_SUCCESS':
      return Colors.green;
    case 'BOOKING_CANCELLED':
      return Colors.red;
    case 'BOOKING_REMINDER':
      return DEKATColors.primary;
    case 'PROMO':
    case 'LOYALTY_POINTS':
      return Colors.amber[700]!;
    case 'REVIEW_REMINDER':
      return Colors.orange;
    case 'NEWSLETTER':
      return Colors.blue;
    default:
      return DEKATColors.primary;
  }
}

class NotificationPreferencesPage extends ConsumerWidget {
  const NotificationPreferencesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final prefs = ref.watch(notificationPrefsProvider);

    NotificationPreference prefOf(String type) =>
        prefs.firstWhere((p) => p.type == type);

    void updatePref(String type, {bool? email, bool? push, bool? inApp}) {
      ref.read(notificationPrefsProvider.notifier).state = prefs
          .map((p) => p.type == type
              ? p.copyWith(email: email, push: push, inApp: inApp)
              : p)
          .toList();
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Preferensi Notifikasi'),
        backgroundColor: Colors.white,
        foregroundColor: DEKATColors.textPrimary,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: DEKATColors.primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: DEKATColors.primary.withValues(alpha: 0.2),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.tune_rounded,
                    color: DEKATColors.primary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'Atur notifikasi mana yang ingin Anda terima',
                    style: TextStyle(fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          ..._prefGroups.map((group) {
            final groupPrefs =
                group.types.map(prefOf).toList();
            final activeCount = groupPrefs
                .where((p) => p.email || p.push || p.inApp)
                .length;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(group.icon,
                        size: 18, color: DEKATColors.primary),
                    const SizedBox(width: 8),
                    Text(
                      group.title,
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: DEKATColors.primary
                            .withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '$activeCount/${groupPrefs.length} aktif',
                        style: const TextStyle(
                          color: DEKATColors.primary,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Padding(
                  padding: const EdgeInsets.only(left: 26),
                  child: Text(
                    group.subtitle,
                    style: TextStyle(
                        color: Colors.grey[500], fontSize: 13),
                  ),
                ),
                const SizedBox(height: 10),
                ...groupPrefs.map((pref) => RepaintBoundary(
                      child: _PreferenceCard(
                        pref: pref,
                        onChanged: updatePref,
                      ),
                    )),
                const SizedBox(height: 16),
              ],
            );
          }),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                      content: Text('Preferensi disimpan')),
                );
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: DEKATColors.primary,
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Simpan Preferensi',
                  style: TextStyle(
                      fontSize: 15, fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _PreferenceCard extends StatelessWidget {
  final NotificationPreference pref;
  final void Function(String type,
      {bool? email, bool? push, bool? inApp}) onChanged;

  const _PreferenceCard({
    required this.pref,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final iconColor = _colorForType(pref.type);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(9),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(_iconForType(pref.type),
                    color: iconColor, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(pref.label,
                        style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14)),
                    const SizedBox(height: 2),
                    Text(pref.description,
                        style: TextStyle(
                            color: Colors.grey[500], fontSize: 12)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _ToggleChip(
                label: 'Email',
                value: pref.email,
                onChanged: (v) =>
                    onChanged(pref.type, email: v),
              ),
              const SizedBox(width: 8),
              _ToggleChip(
                label: 'Push',
                value: pref.push,
                onChanged: (v) =>
                    onChanged(pref.type, push: v),
              ),
              const SizedBox(width: 8),
              _ToggleChip(
                label: 'In-App',
                value: pref.inApp,
                onChanged: (v) =>
                    onChanged(pref.type, inApp: v),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ToggleChip extends StatelessWidget {
  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _ToggleChip({required this.label, required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onChanged(!value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: value ? DEKATColors.primary.withValues(alpha:0.1) : Colors.grey[100],
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: value ? DEKATColors.primary : Colors.grey[300]!),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(value ? Icons.check_circle : Icons.circle_outlined,
                size: 16, color: value ? DEKATColors.primary : Colors.grey),
            const SizedBox(width: 4),
            Text(label, style: TextStyle(
              fontSize: 12,
              color: value ? DEKATColors.primary : Colors.grey,
              fontWeight: value ? FontWeight.bold : FontWeight.normal,
            )),
          ],
        ),
      ),
    );
  }
}
