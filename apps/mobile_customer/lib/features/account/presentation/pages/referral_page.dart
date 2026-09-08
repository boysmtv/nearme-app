import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

class ReferralPage extends ConsumerStatefulWidget {
  const ReferralPage({super.key});

  @override
  ConsumerState<ReferralPage> createState() => _ReferralPageState();
}

class _ReferralPageState extends ConsumerState<ReferralPage> {
  String _referralCode = 'DEKAT-XXXX';
  int _referralCount = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final api = ApiService();
      final res = await api.dio.get('/customer/profile');
      if (res.data['success'] == true) {
        final data = res.data['data'] as Map<String, dynamic>;
        setState(() {
          _referralCode = data['referralCode'] as String? ?? 'DEKAT-${(data['id'] as String? ?? 'XXXX').substring(0, 8).toUpperCase()}';
          _referralCount = data['referralCount'] as int? ?? 0;
        });
      }
    } catch (e) {
      debugPrint('Error loading profile: $e');
    }
    setState(() => _isLoading = false);
  }

  void _copyCode() {
    Clipboard.setData(ClipboardData(text: _referralCode));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Kode referral disalin!')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Undang Teman')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFF59E0B), Color(0xFFEA580C)],
                      ),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Kode Referral Anda', style: TextStyle(color: Colors.white70, fontSize: 14)),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Text(
                              _referralCode,
                              style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold, letterSpacing: 2),
                            ),
                            const Spacer(),
                            IconButton(
                              onPressed: _copyCode,
                              icon: const Icon(Icons.copy, color: Colors.white),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text('Bagikan kode ini kepada teman Anda', style: TextStyle(color: Colors.white70)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: Card(
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              children: [
                                Text('$_referralCount', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF6C63FF))),
                                const SizedBox(height: 4),
                                Text('Teman Diundang', style: TextStyle(color: Colors.grey[600])),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Card(
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              children: [
                                Text('${_referralCount * 50}', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFFF59E0B))),
                                const SizedBox(height: 4),
                                Text('Poin Didapat', style: TextStyle(color: Colors.grey[600])),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Cara Kerja', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 16),
                          _buildStep(1, 'Bagikan Kode', 'Kirim kode referral ke teman'),
                          _buildStep(2, 'Teman Mendaftar', 'Teman daftar dengan kode Anda'),
                          _buildStep(3, 'Dapat 50 Poin', 'Anda dan teman dapat 50 poin'),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _copyCode,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6C63FF),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Bagikan ke Teman', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildStep(int number, String title, String subtitle) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: const Color(0xFF6C63FF).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Text('$number', style: const TextStyle(color: Color(0xFF6C63FF), fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
                Text(subtitle, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
