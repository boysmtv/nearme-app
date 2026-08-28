import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

class OnboardingPage extends ConsumerStatefulWidget {
  const OnboardingPage({super.key});
  @override
  ConsumerState<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends ConsumerState<OnboardingPage> {
  final _pageController = PageController();
  int _currentPage = 0;

  final _steps = const [
    _Step(icon: Icons.storefront_rounded, title: 'Daftarkan Bisnismu', desc: 'Buat profil usaha & tampilkan layanan terbaikmu ke ribuan pelanggan.', gradient: DEKATColors.softViolet, bg: Color(0xFFF3F0FF)),
    _Step(icon: Icons.calendar_month_rounded, title: 'Kelola Booking', desc: 'Terima, tolak, atau jadwalkan ulang booking pelanggan dengan mudah.', gradient: DEKATColors.softSky, bg: Color(0xFFF0F7FF)),
    _Step(icon: Icons.account_balance_wallet_rounded, title: 'Pantau Pendapatan', desc: 'Lihat ringkasan harian, mingguan, dan riwayat transaksi secara real-time.', gradient: DEKATColors.softMint, bg: Color(0xFFEFFAF3)),
    _Step(icon: Icons.auto_graph_rounded, title: 'Kembangkan Usaha', desc: 'Dapatkan insight & laporan untuk buat keputusan bisnis lebih cerdas.', gradient: DEKATColors.softPeach, bg: Color(0xFFFFF6E8)),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      body: SafeArea(
        child: Column(children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Row(children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey[200]!)),
                child: Row(children: [
                  Container(width: 8, height: 8, decoration: const BoxDecoration(color: DEKATColors.primary, shape: BoxShape.circle)),
                  const SizedBox(width: 6),
                  Text('${_currentPage + 1} / ${_steps.length}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: DEKATColors.textSecondary)),
                ]),
              ),
              const Spacer(),
              TextButton(
                onPressed: () => context.go('/login'),
                style: TextButton.styleFrom(foregroundColor: DEKATColors.textSecondary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  const Text('Lewati', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(width: 4),
                  Container(padding: const EdgeInsets.all(3), decoration: BoxDecoration(color: Colors.grey[100], shape: BoxShape.circle), child: Icon(Icons.close_rounded, size: 14, color: Colors.grey[600])),
                ]),
              ),
            ]),
          ),
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              itemCount: _steps.length,
              onPageChanged: (i) => setState(() => _currentPage = i),
              physics: const BouncingScrollPhysics(),
              itemBuilder: (context, i) {
                final step = _steps[i];
                final isActive = i == _currentPage;
                return Padding(
                  padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
                  child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0, end: isActive ? 1 : 0.9),
                      duration: const Duration(milliseconds: 500),
                      curve: Curves.easeOutBack,
                      builder: (context, v, child) => Transform.scale(scale: v, child: child),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          Container(
                            width: 200,
                            height: 200,
                            decoration: BoxDecoration(color: step.bg, shape: BoxShape.circle),
                          ),
                          Container(
                            width: 140,
                            height: 140,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(colors: step.gradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
                              shape: BoxShape.circle,
                              boxShadow: [BoxShadow(color: step.gradient[0].withValues(alpha: 0.30), blurRadius: 24, offset: const Offset(0, 12))],
                            ),
                            child: Icon(step.icon, size: 64, color: Colors.white),
                          ),
                          Positioned(
                            right: 28,
                            top: 22,
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 10)]),
                              child: Icon(Icons.auto_awesome_rounded, size: 16, color: step.gradient[0]),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(color: step.gradient[1], borderRadius: BorderRadius.circular(20), border: Border.all(color: step.gradient[0].withValues(alpha: 0.18))),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Icon(Icons.sparkles, size: 12, color: step.gradient[0]),
                        const SizedBox(width: 6),
                        Text('Langkah ${i + 1}', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: step.gradient[0], letterSpacing: 0.4)),
                      ]),
                    ),
                    const SizedBox(height: 16),
                    Text(step.title, textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.5, height: 1.15)),
                    const SizedBox(height: 12),
                    Text(step.desc, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: DEKATColors.textSecondary, height: 1.55, fontSize: 14)),
                  ]),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 0),
            child: Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(_steps.length, (i) {
              final active = _currentPage == i;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 320),
                curve: Curves.easeOutCubic,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: active ? 26 : 8,
                height: 8,
                decoration: BoxDecoration(
                  gradient: active ? LinearGradient(colors: _steps[i].gradient) : null,
                  color: active ? null : Colors.grey[300],
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: active ? [BoxShadow(color: _steps[i].gradient[0].withValues(alpha: 0.3), blurRadius: 6)] : null,
                ),
              );
            })),
          ),
          const SizedBox(height: 22),
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
            child: SizedBox(
              width: double.infinity,
              height: 54,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: _steps[_currentPage].gradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [BoxShadow(color: _steps[_currentPage].gradient[0].withValues(alpha: 0.32), blurRadius: 14, offset: const Offset(0, 6))],
                ),
                child: ElevatedButton(
                  onPressed: () {
                    if (_currentPage < _steps.length - 1) {
                      _pageController.nextPage(duration: const Duration(milliseconds: 360), curve: Curves.easeOutCubic);
                    } else {
                      context.go('/login');
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
                  child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Text(_currentPage < _steps.length - 1 ? 'Lanjut' : 'Mulai Sekarang', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: Colors.white)),
                    const SizedBox(width: 8),
                    Container(padding: const EdgeInsets.all(4), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.22), shape: BoxShape.circle), child: const Icon(Icons.arrow_forward_rounded, size: 16, color: Colors.white)),
                  ]),
                ),
              ),
            ),
          ),
        ]),
      ),
    );
  }
}

class _Step {
  final IconData icon;
  final String title, desc;
  final List<Color> gradient;
  final Color bg;
  const _Step({required this.icon, required this.title, required this.desc, required this.gradient, required this.bg});
}
