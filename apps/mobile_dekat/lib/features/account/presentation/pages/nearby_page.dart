import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
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

  static const _radiusOptions = [1.0, 3.0, 5.0, 10.0, 20.0];

  @override
  void initState() {
    super.initState();
    _initLocation();
  }

  Future<void> _initLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        _userLocation = const latlng.LatLng(-6.2088, 106.8456);
        _loadNearby();
        return;
      }
      final pos = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
              accuracy: LocationAccuracy.high, timeLimit: Duration(seconds: 10)));
      if (!mounted) return;
      _userLocation = latlng.LatLng(pos.latitude, pos.longitude);
      _loadNearby();
    } catch (e) {
      _userLocation = const latlng.LatLng(-6.2088, 106.8456);
      _loadNearby();
    }
  }

  Future<void> _loadNearby() async {
    setState(() => _isLoading = true);
    try {
      final api = ApiService();
      final res = await api.dio.get(
        '/public/providers?q=&radius=$_radius&lat=${_userLocation!.latitude}&lng=${_userLocation!.longitude}',
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

  String? _distanceText(dynamic p) {
    final d = p['distance'];
    if (d == null) return null;
    final km = d is num ? d.toDouble() : double.tryParse(d.toString());
    if (km == null) return null;
    if (km < 1) return '${(km * 1000).round()} m';
    return '${km.toStringAsFixed(1)} km';
  }

  String? _imageUrl(dynamic p) {
    final u = p['imageUrl'] ?? p['image'] ?? p['photo'];
    if (u == null) return null;
    final s = u.toString();
    return s.isEmpty ? null : s;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Provider Terdekat'),
      ),
      body: _userLocation == null
          ? const ShimmerCardList()
          : Column(
              children: [
                // Radius selector pills
                Container(
                  width: double.infinity,
                  color: Colors.white,
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.radar_rounded, size: 16, color: DEKATColors.primary),
                          const SizedBox(width: 6),
                          const Text(
                            'Radius pencarian',
                            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                          ),
                          const Spacer(),
                          Text(
                            '${_providers.length} provider ditemukan',
                            style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: _radiusOptions.map((r) {
                            final selected = _radius == r;
                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: ChoiceChip(
                                label: Text('${r.toInt()} km'),
                                selected: selected,
                                onSelected: (_) {
                                  setState(() => _radius = r);
                                  _loadNearby();
                                },
                                selectedColor: DEKATColors.primary,
                                backgroundColor: Colors.white,
                                labelStyle: TextStyle(
                                  color: selected ? Colors.white : Colors.grey[700],
                                  fontWeight: FontWeight.w700,
                                  fontSize: 12,
                                ),
                                side: BorderSide(
                                  color: selected ? DEKATColors.primary : Colors.grey.shade300,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                showCheckmark: false,
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ],
                  ),
                ),
                // Map
                Expanded(
                  flex: _selectedProviderIndex != null ? 2 : 3,
                  child: Container(
                    margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
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
                                      child: Container(
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
                            top: 10,
                            left: 10,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Colors.grey.shade200),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.06),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: const BoxDecoration(
                                      color: Colors.red,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    'Lokasi Anda',
                                    style: TextStyle(fontSize: 11, color: Colors.grey[700], fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
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
                      ? const ShimmerCardList(itemCount: 3)
                      : _providers.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    width: 84,
                                    height: 84,
                                    decoration: BoxDecoration(
                                      color: DEKATColors.primary.withValues(alpha: 0.08),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.location_off_rounded,
                                      size: 40,
                                      color: DEKATColors.primary,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  const Text(
                                    'Tidak ada provider di sekitar',
                                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Coba perluas radius atau cari manual',
                                    style: TextStyle(color: Colors.grey[500], fontSize: 13),
                                  ),
                                  const SizedBox(height: 12),
                                  OutlinedButton.icon(
                                    onPressed: () => context.push('/search'),
                                    icon: const Icon(Icons.search_rounded, size: 18),
                                    label: const Text('Cari Manual'),
                                  ),
                                ],
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                              itemCount: _providers.length,
                              itemBuilder: (context, index) {
                                final p = _providers[index] as Map<String, dynamic>;
                                final isSelected = _selectedProviderIndex == index;
                                return RepaintBoundary(
                                  child: _buildProviderCard(context, p, isSelected, index),
                                );
                              },
                            ),
                ),
              ],
            ),
    );
  }

  Widget _buildProviderCard(BuildContext context, Map<String, dynamic> p, bool isSelected, int index) {
    final color = _markerColor(p['category'] as String?);
    final distance = _distanceText(p);
    final imageUrl = _imageUrl(p);
    final rating = p['rating'] as num?;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isSelected ? DEKATColors.primary.withValues(alpha: 0.05) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSelected ? DEKATColors.primary.withValues(alpha: 0.4) : Colors.grey.shade200,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => context.push('/provider/${p['slug'] ?? p['id']}'),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: imageUrl != null
                      ? CachedNetworkImage(
                          imageUrl: imageUrl,
                          width: 64,
                          height: 64,
                          memCacheWidth: 128,
                          memCacheHeight: 128,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => Container(
                            width: 64,
                            height: 64,
                            color: Colors.grey.shade200,
                          ),
                          errorWidget: (context, url, error) => Container(
                            width: 64,
                            height: 64,
                            color: color.withValues(alpha: 0.12),
                            child: Icon(Icons.store_rounded, color: color, size: 28),
                          ),
                        )
                      : Container(
                          width: 64,
                          height: 64,
                          color: color.withValues(alpha: 0.12),
                          child: Center(
                            child: Text(
                              (p['name'] as String? ?? '?')[0].toUpperCase(),
                              style: TextStyle(
                                color: color,
                                fontWeight: FontWeight.bold,
                                fontSize: 24,
                              ),
                            ),
                          ),
                        ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              p['name'] as String? ?? 'Provider',
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (distance != null)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: DEKATColors.primary.withValues(alpha: 0.08),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.near_me_rounded, size: 11, color: DEKATColors.primary),
                                  const SizedBox(width: 3),
                                  Text(
                                    distance,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: DEKATColors.primary,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          if (rating != null && rating > 0) ...[
                            Icon(Icons.star_rounded, size: 14, color: Colors.amber[700]),
                            const SizedBox(width: 2),
                            Text(
                              rating.toStringAsFixed(1),
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: color.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                (p['category'] as String? ?? 'Umum').toUpperCase(),
                                style: TextStyle(
                                  color: color,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.3,
                                ),
                              ),
                            ),
                          ] else
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: color.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                (p['category'] as String? ?? 'Umum').toUpperCase(),
                                style: TextStyle(
                                  color: color,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.3,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.location_on_outlined, size: 12, color: Colors.grey[500]),
                          const SizedBox(width: 3),
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
                    ],
                  ),
                ),
                const SizedBox(width: 4),
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: isSelected ? DEKATColors.primary : Colors.grey[50],
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isSelected ? DEKATColors.primary : Colors.grey.shade200,
                    ),
                  ),
                  child: Icon(
                    Icons.chevron_right_rounded,
                    size: 16,
                    color: isSelected ? Colors.white : Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSelectedProviderCard(Map<String, dynamic> p) {
    final color = _markerColor(p['category'] as String?);
    final distance = _distanceText(p);
    final rating = p['rating'] as num?;
    return RepaintBoundary(
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.3)),
          boxShadow: [
            BoxShadow(
              color: DEKATColors.primary.withValues(alpha: 0.12),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Text(
                  (p['name'] as String? ?? '?')[0].toUpperCase(),
                  style: TextStyle(
                    color: color,
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
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
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      if (rating != null && rating > 0) ...[
                        Icon(Icons.star_rounded, size: 13, color: Colors.amber[700]),
                        const SizedBox(width: 2),
                        Text(
                          rating.toStringAsFixed(1),
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(width: 6),
                      ],
                      Text(
                        p['category'] as String? ?? '',
                        style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                      ),
                      if (distance != null) ...[
                        const SizedBox(width: 6),
                        Text(
                          '• $distance',
                          style: const TextStyle(
                            fontSize: 12,
                            color: DEKATColors.primary,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            FilledButton.icon(
              onPressed: () => context.push('/provider/${p['slug'] ?? p['id']}'),
              style: FilledButton.styleFrom(
                backgroundColor: DEKATColors.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              icon: const Icon(Icons.arrow_forward_rounded, size: 16),
              label: const Text('Lihat', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
    );
  }
}
