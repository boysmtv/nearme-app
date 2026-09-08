import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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

class NotificationPreferencesPage extends ConsumerWidget {
  const NotificationPreferencesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final prefs = ref.watch(notificationPrefsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Preferensi Notifikasi')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Atur notifikasi mana yang ingin Anda terima',
              style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 16),
          ...prefs.map((pref) => Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(pref.label, style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(pref.description, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _ToggleChip(
                        label: 'Email',
                        value: pref.email,
                        onChanged: (v) {
                          ref.read(notificationPrefsProvider.notifier).state =
                              prefs.map((p) => p.type == pref.type ? p.copyWith(email: v) : p).toList();
                        },
                      ),
                      _ToggleChip(
                        label: 'Push',
                        value: pref.push,
                        onChanged: (v) {
                          ref.read(notificationPrefsProvider.notifier).state =
                              prefs.map((p) => p.type == pref.type ? p.copyWith(push: v) : p).toList();
                        },
                      ),
                      _ToggleChip(
                        label: 'In-App',
                        value: pref.inApp,
                        onChanged: (v) {
                          ref.read(notificationPrefsProvider.notifier).state =
                              prefs.map((p) => p.type == pref.type ? p.copyWith(inApp: v) : p).toList();
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          )),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Preferensi disimpan')),
              );
              Navigator.pop(context);
            },
            child: const Text('Simpan Preferensi'),
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
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: value ? Colors.deepPurple.withOpacity(0.1) : Colors.grey[100],
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: value ? Colors.deepPurple : Colors.grey[300]!),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(value ? Icons.check_circle : Icons.circle_outlined,
                size: 16, color: value ? Colors.deepPurple : Colors.grey),
            const SizedBox(width: 4),
            Text(label, style: TextStyle(
              fontSize: 12,
              color: value ? Colors.deepPurple : Colors.grey,
              fontWeight: value ? FontWeight.bold : FontWeight.normal,
            )),
          ],
        ),
      ),
    );
  }
}
