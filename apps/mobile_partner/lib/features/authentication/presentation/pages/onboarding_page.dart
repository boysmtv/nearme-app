import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class OnboardingPage extends ConsumerStatefulWidget {
  const OnboardingPage({super.key});
  @override
  ConsumerState<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends ConsumerState<OnboardingPage> {
  final _pageController = PageController();
  int _currentPage = 0;

  final _steps = const [
    _Step(icon: Icons.store, title: 'Register Your Business', desc: 'Create your business profile and list your services.'),
    _Step(icon: Icons.calendar_month, title: 'Manage Bookings', desc: 'Accept or decline bookings from customers.'),
    _Step(icon: Icons.payments, title: 'Track Earnings', desc: 'View your earnings and payment history.'),
    _Step(icon: Icons.analytics, title: 'Grow Your Business', desc: 'Access insights and reports to grow your business.'),
  ];

  @override
  void dispose() { _pageController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: Column(children: [
        Align(alignment: Alignment.topRight, child: TextButton(onPressed: () => context.go('/login'), child: const Text('Skip'))),
        Expanded(child: PageView.builder(
          controller: _pageController, itemCount: _steps.length,
          onPageChanged: (i) => setState(() => _currentPage = i),
          itemBuilder: (context, i) {
            final step = _steps[i];
            return Padding(padding: const EdgeInsets.all(32), child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Container(width: 120, height: 120, decoration: BoxDecoration(color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1), shape: BoxShape.circle),
                child: Icon(step.icon, size: 60, color: Theme.of(context).colorScheme.primary)),
              const SizedBox(height: 32),
              Text(step.title, textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Text(step.desc, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.grey)),
            ]));
          },
        )),
        Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(_steps.length, (i) => Container(
          margin: const EdgeInsets.symmetric(horizontal: 4), width: _currentPage == i ? 24 : 8, height: 8,
          decoration: BoxDecoration(color: _currentPage == i ? Theme.of(context).colorScheme.primary : Colors.grey[300], borderRadius: BorderRadius.circular(4)),
        ))),
        const SizedBox(height: 32),
        Padding(padding: const EdgeInsets.all(24), child: ElevatedButton(
          onPressed: () {
            if (_currentPage < _steps.length - 1) {
              _pageController.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
            } else {
              context.go('/login');
            }
          },
          style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
          child: Text(_currentPage < _steps.length - 1 ? 'Next' : 'Get Started'),
        )),
      ])),
    );
  }
}

class _Step {
  final IconData icon;
  final String title, desc;
  const _Step({required this.icon, required this.title, required this.desc});
}
