import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:latlong2/latlong.dart' as latlng;
import '../../../../shared/widgets/shimmer_loading.dart';

class NearbyPage extends StatefulWidget {
  const NearbyPage({super.key});

  @override
  State<NearbyPage> createState() => _NearbyPageState();
}

class _NearbyPageState extends State<NearbyPage> {
  List<dynamic> _providers = [];
  bool _isLoading = true;
  double _radius = 5;
  latlng.LatLng? _userLocation;
  final MapController _mapController = MapController();
  int? _selectedProviderIndex;

  @override
  void initState() {
    super.initState();
    _userLocation = const latlng.LatLng(-6.2088, 106.8456);
    _loadNearby();
  }

  Future<void> _loadNearby() async {
    setState(() => _isLoading = true);
    try {
      final api = ApiService();
      final res = await api.dio.get(
        '/public/providers?q=&radius=$_radius&lat=${_userLocation?.latitude ?? -6.2088}&lng=${_userLocation?.longitude ?? 106.8456}',
      );
      if (!mounted) return;
      if (res.data['success'] == true) {
        final data = res.data['data'];
        setState(() {
          _providers = data is List ? data : (data['providers'] ?? []);
        });
      }
    } catch (e) {
      debugPrint('Error loading nearby: $e');
    }
    if (!mounted) return;
    setState(() => _isLoading = false);
  }

  latlng.LatLng? _providerLocation(dynamic p) {
    final lat = p['lat'] ?? p['latitude'];
    final lng = p['lng'] ?? p['longitude'];
    if (lat == null || lng == null) return null;
    return latlng.LatLng(
      (lat is num) ? lat.toDouble() : double.tryParse(lat.toString()) ?? 0,
      (lng is num) ? lng.toDouble() : double.tryParse(lng.toString()) ?? 0,
    );
  }

  Color _markerColor(String? category) {
    switch (category) {
      case 'Barbershop':
        return Colors.blue;
      case 'Salon':
        return Colors.pink;
      case 'Kecantikan':
        return Colors.purple;
      case 'Spa':
        return Colors.teal;
      default:
        return const Color(0xFF6C63FF);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Provider Terdekat'),
        actions: [
          DropdownButton<double>(
            value: _radius,
            underline: const SizedBox(),
            icon: const Icon(Icons.filter_list),
            items: [1, 3, 5, 10, 20].map((r) {
              return DropdownMenuItem(
                value: r.toDouble(),
                child: Text('$r km'),
              );
            }).toList(),
            onChanged: (v) {
              if (v != null) {
                setState(() => _radius = v);
                _loadNearby();
              }
            },
          ),
        ],
      ),
      body: _userLocation == null
          ? const ShimmerCardList()
          : Column(
              children: [
                // Map
                Expanded(
                  flex: _selectedProviderIndex != null ? 2 : 3,
                  child: Stack(
                    children: [
                      FlutterMap(
                        mapController: _mapController,
                        options: MapOptions(
                          initialCenter: _userLocation!,
                          initialZoom: 13,
                          onTap: (_, __) {
                            setState(() => _selectedProviderIndex = null);
                          },
                        ),
                        children: [
                          TileLayer(
                            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                            userAgentPackageName: 'id.dekat.customer',
                          ),
                          // Radius circle
                          CircleLayer(
                            circles: [
                              CircleMarker(
                                point: _userLocation!,
                                radius: _radius * 1000,
                                useRadiusInMeter: true,
                                color: const Color(0xFF6C63FF).withValues(alpha: 0.1),
                                borderColor: const Color(0xFF6C63FF),
                                borderStrokeWidth: 2,
                              ),
                            ],
                          ),
                          // User marker
                          MarkerLayer(
                            markers: [
                              Marker(
                                point: _userLocation!,
                                width: 24,
                                height: 24,
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: Colors.red,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 3),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.3),
                                        blurRadius: 6,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                          // Provider markers
                          MarkerLayer(
                            markers: _providers.asMap().entries.map((entry) {
                              final i = entry.key;
                              final p = entry.value;
                              final loc = _providerLocation(p);
                              if (loc == null) {
                                return Marker(
                                  point: _userLocation!,
                                  width: 0,
                                  height: 0,
                                  child: const SizedBox(),
                                );
                              }
                              final isSelected = _selectedProviderIndex == i;
                              final color = _markerColor(p['category'] as String?);
                              return Marker(
                                point: loc,
                                width: isSelected ? 44 : 36,
                                height: isSelected ? 44 : 36,
                                child: GestureDetector(
                                  onTap: () {
                                    setState(() => _selectedProviderIndex = i);
                                    _mapController.move(loc, 15);
                                  },
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    decoration: BoxDecoration(
                                      color: color,
                                      borderRadius: BorderRadius.circular(12).copyWith(
                                        bottomRight: const Radius.circular(4),
                                      ),
                                      border: Border.all(
                                        color: Colors.white,
                                        width: isSelected ? 3 : 2,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withValues(alpha: 0.3),
                                          blurRadius: isSelected ? 10 : 4,
                                        ),
                                      ],
                                    ),
                                    child: const Icon(
                                      Icons.store_rounded,
                                      color: Colors.white,
                                      size: 18,
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                      // Legend
                      Positioned(
                        top: 8,
                        left: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.9),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(width: 8, height: 8, decoration: BoxDecoration(color: Colors.red, shape: BoxShape.circle)),
                              const SizedBox(width: 4),
                              Text('Anda', style: TextStyle(fontSize: 11, color: Colors.grey[700])),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                // Selected provider info card
                if (_selectedProviderIndex != null &&
                    _selectedProviderIndex! < _providers.length)
                  _buildSelectedProviderCard(_providers[_selectedProviderIndex!]),
                // Provider list
                Expanded(
                  flex: _selectedProviderIndex != null ? 1 : 2,
                  child: _isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : _providers.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.location_off, size: 48, color: Colors.grey[400]),
                                  const SizedBox(height: 12),
                                  Text('Tidak ada provider di sekitar',
                                      style: TextStyle(color: Colors.grey[600])),
                                  const SizedBox(height: 8),
                                  TextButton(
                                    onPressed: () => context.push('/search'),
                                    child: const Text('Cari Manual'),
                                  ),
                                ],
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              itemCount: _providers.length,
                              itemBuilder: (context, index) {
                                final p = _providers[index] as Map<String, dynamic>;
                                final isSelected = _selectedProviderIndex == index;
                                return Card(
                                  margin: const EdgeInsets.only(bottom: 8),
                                  color: isSelected ? const Color(0xFF6C63FF).withValues(alpha: 0.05) : null,
                                  child: ListTile(
                                    contentPadding: const EdgeInsets.all(12),
                                    leading: CircleAvatar(
                                      radius: 24,
                                      backgroundColor: _markerColor(p['category'] as String?).withValues(alpha: 0.15),
                                      child: Text(
                                        (p['name'] as String? ?? '?')[0].toUpperCase(),
                                        style: TextStyle(
                                          color: _markerColor(p['category'] as String?),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    title: Text(
                                      p['name'] as String? ?? 'Provider',
                                      style: const TextStyle(fontWeight: FontWeight.w600),
                                    ),
                                    subtitle: Row(
                                      children: [
                                        if (p['rating'] != null && (p['rating'] as num) > 0) ...[
                                          Icon(Icons.star, size: 14, color: Colors.amber[600]),
                                          const SizedBox(width: 2),
                                          Text(
                                            (p['rating'] as num).toStringAsFixed(1),
                                            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                                          ),
                                          const SizedBox(width: 8),
                                        ],
                                        Expanded(
                                          child: Text(
                                            p['location'] as String? ?? p['address'] as String? ?? '',
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                                          ),
                                        ),
                                      ],
                                    ),
                                    trailing: const Icon(Icons.chevron_right),
                                    onTap: () => context.push('/provider/${p['slug'] ?? p['id']}'),
                                  ),
                                );
                              },
                            ),
                ),
              ],
            ),
    );
  }

  Widget _buildSelectedProviderCard(Map<String, dynamic> p) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: _markerColor(p['category'] as String?).withValues(alpha: 0.15),
            child: Text(
              (p['name'] as String? ?? '?')[0].toUpperCase(),
              style: TextStyle(
                color: _markerColor(p['category'] as String?),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  p['name'] as String? ?? '',
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
                const SizedBox(height: 2),
                Text(
                  p['category'] as String? ?? '',
                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                ),
              ],
            ),
          ),
          TextButton.icon(
            onPressed: () => context.push('/provider/${p['slug'] ?? p['id']}'),
            icon: const Icon(Icons.arrow_forward, size: 16),
            label: const Text('Lihat'),
          ),
        ],
      ),
    );
  }
}
