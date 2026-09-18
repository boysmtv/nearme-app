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
    _Step(
        icon: Icons.store_rounded,
        title: 'Daftarkan Bisnis Anda',
        desc: 'Buat profil bisnis dan daftarkan layanan Anda.'),
    _Step(
        icon: Icons.calendar_month_rounded,
        title: 'Kelola Booking',
        desc: 'Terima atau tolak booking dari pelanggan.'),
    _Step(
        icon: Icons.payments_rounded,
        title: 'Pantau Pendapatan',
        desc: 'Lihat pendapatan dan riwayat pembayaran Anda.'),
    _Step(
        icon: Icons.analytics_rounded,
        title: 'Kembangkan Bisnis',
        desc: 'Akses wawasan dan laporan untuk mengembangkan bisnis.'),
  ];

  @override
  void dispose() { _pageController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final isLast = _currentPage == _steps.length - 1;
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 16, 0),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: DEKATColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.business_center_rounded,
                            color: DEKATColors.primary, size: 16),
                        SizedBox(width: 6),
                        Text('DEKAT Partner',
                            style: TextStyle(
                                color: DEKATColors.primary,
                                fontWeight: FontWeight.w800,
                                fontSize: 12)),
                      ],
                    ),
                  ),
                  const Spacer(),
                  TextButton(
                      onPressed: () => context.go('/login'),
                      child: Text('Lewati',
                          style: TextStyle(
                              color: Colors.grey[600],
                              fontWeight: FontWeight.w700))),
                ],
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: _steps.length,
                onPageChanged: (i) => setState(() => _currentPage = i),
                itemBuilder: (context, i) {
                  final step = _steps[i];
                  return Padding(
                    padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
                    child: RepaintBoundary(
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 24, vertical: 36),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border:
                              Border.all(color: Colors.grey.shade200),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 120,
                              height: 120,
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [
                                    DEKATColors.primary,
                                    Color(0xFF8B7CFF)
                                  ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                borderRadius: BorderRadius.circular(32),
                              ),
                              child: Icon(step.icon,
                                  size: 56, color: Colors.white),
                            ),
                            const SizedBox(height: 28),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: DEKATColors.primary
                                    .withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text('Langkah ${i + 1} dari ${_steps.length}',
                                  style: const TextStyle(
                                      color: DEKATColors.primary,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 11)),
                            ),
                            const SizedBox(height: 12),
                            Text(step.title,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 21)),
                            const SizedBox(height: 10),
                            Text(step.desc,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                    color: Colors.grey[600],
                                    fontSize: 14,
                                    height: 1.5)),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                    _steps.length,
                    (i) => Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: _currentPage == i ? 24 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                              color: _currentPage == i
                                  ? DEKATColors.primary
                                  : Colors.grey[300],
                              borderRadius: BorderRadius.circular(4)),
                        ))),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
              child: RepaintBoundary(
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Row(
                    children: [
                      if (!isLast)
                        Expanded(
                          child: Text(
                              'Geser atau ketuk Lanjut untuk melihat fitur berikutnya',
                              style: TextStyle(
                                  color: Colors.grey[600], fontSize: 12)),
                        ),
                      if (isLast)
                        Expanded(
                          child: Text(
                              'Siap mengembangkan bisnis Anda bersama DEKAT?',
                              style: TextStyle(
                                  color: Colors.grey[600], fontSize: 12)),
                        ),
                      const SizedBox(width: 12),
                      ElevatedButton(
                        onPressed: () {
                          if (_currentPage < _steps.length - 1) {
                            _pageController.nextPage(
                                duration:
                                    const Duration(milliseconds: 300),
                                curve: Curves.easeInOut);
                          } else {
                            context.go('/login');
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: DEKATColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 28, vertical: 14),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Text(
                            _currentPage < _steps.length - 1
                                ? 'Lanjut'
                                : 'Mulai',
                            style:
                                const TextStyle(fontWeight: FontWeight.w800)),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Step {
  final IconData icon;
  final String title, desc;
  const _Step({required this.icon, required this.title, required this.desc});
}
