import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/models/rows.dart';

final providerListProvider = FutureProvider.autoDispose<List<ProviderRow>>((ref) async {
  final response = await ApiService().getProviders();
  return ((response.data['data'] ?? []) as List)
      .map((e) => ProviderRow.fromJson(e as Map<String, dynamic>))
      .toList();
});

class ProviderListPage extends ConsumerWidget {
  const ProviderListPage({super.key});

  static const _grads = [
    DEKATColors.softViolet,
    DEKATColors.softPink,
    DEKATColors.softMint,
    DEKATColors.softPeach,
    DEKATColors.softSky,
    DEKATColors.softLavender,
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final providersAsync = ref.watch(providerListProvider);
    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(mainAxisSize: MainAxisSize.min, children: [
          Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.storefront_rounded, color: Colors.white, size: 18)),
          const SizedBox(width: 10),
          const Text('Providers', style: TextStyle(fontWeight: FontWeight.w800)),
        ]),
        centerTitle: true,
      ),
      body: providersAsync.when(
        data: (providers) {
          if (providers.isEmpty) {
            return Center(
              child: Container(
                margin: const EdgeInsets.all(24),
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.08)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 14)]),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(16)), child: const Icon(Icons.storefront_rounded, size: 40, color: Colors.white)),
                    const SizedBox(height: 16),
                    Text('No providers found', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text('Try again later ✨', style: TextStyle(color: Colors.grey[500], fontSize: 13)),
                  ],
                ),
              ),
            );
          }
          return ListView.builder(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.all(16),
            itemCount: providers.length,
            itemBuilder: (context, index) {
              final p = providers[index];
              final grad = _grads[index % _grads.length];
              return TweenAnimationBuilder<double>(
                tween: Tween(begin: 0, end: 1),
                duration: Duration(milliseconds: 300 + index * 40),
                curve: Curves.easeOutCubic,
                builder: (context, v, child) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 12 * (1 - v)), child: child)),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: grad.last.withValues(alpha: 0.6)), boxShadow: [BoxShadow(color: grad.first.withValues(alpha: 0.12), blurRadius: 14, offset: const Offset(0, 4))]),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(12),
                    leading: Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(gradient: LinearGradient(colors: grad, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(14), boxShadow: [BoxShadow(color: grad.first.withValues(alpha: 0.2), blurRadius: 8)]),
                      child: const Icon(Icons.storefront_rounded, color: Colors.white, size: 26),
                    ),
                    title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                    subtitle: Container(margin: const EdgeInsets.only(top: 4), padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2), decoration: BoxDecoration(color: grad.last, borderRadius: BorderRadius.circular(7)), child: Text(p.category ?? 'General', style: TextStyle(color: grad.first, fontSize: 11, fontWeight: FontWeight.w600))),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                      decoration: BoxDecoration(color: const Color(0xFFFFF4D6), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFFFD67E).withValues(alpha: 0.4))),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(Icons.star_rounded, size: 14, color: Colors.amber[700]), const SizedBox(width: 3), Text(p.rating.toStringAsFixed(1), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12))]),
                    ),
                    onTap: () => context.push('/provider/${p.slug}'),
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: DEKATColors.primary)),
        error: (e, _) => Center(
          child: Container(
            margin: const EdgeInsets.all(24),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: DEKATColors.error.withValues(alpha: 0.12))),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: DEKATColors.errorLight, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.wifi_off_rounded, color: DEKATColors.error)),
                const SizedBox(height: 12),
                Text('Error: $e', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[700], fontSize: 13)),
                const SizedBox(height: 12),
                FilledButton.icon(onPressed: () => ref.invalidate(providerListProvider), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Retry')),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
