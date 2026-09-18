import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class ShimmerBox extends StatelessWidget {
  final double? width;
  final double? height;
  final double radius;

  const ShimmerBox({
    super.key,
    this.width,
    this.height,
    this.radius = 8,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.grey.shade300,
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}

class ShimmerListTile extends StatelessWidget {
  const ShimmerListTile({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: [
            const ShimmerBox(width: 64, height: 64, radius: 12),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const ShimmerBox(width: double.infinity, height: 14),
                  const SizedBox(height: 8),
                  ShimmerBox(width: MediaQuery.of(context).size.width * 0.5, height: 12),
                  const SizedBox(height: 8),
                  ShimmerBox(width: MediaQuery.of(context).size.width * 0.3, height: 12),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ShimmerCardList extends StatelessWidget {
  final int itemCount;

  const ShimmerCardList({super.key, this.itemCount = 5});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: itemCount,
      itemBuilder: (_, __) => const ShimmerListTile(),
    );
  }
}

class ShimmerGrid extends StatelessWidget {
  final int itemCount;

  const ShimmerGrid({super.key, this.itemCount = 6});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: GridView.builder(
        physics: const NeverScrollableScrollPhysics(),
        shrinkWrap: true,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.75,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        itemCount: itemCount,
        padding: const EdgeInsets.all(16),
        itemBuilder: (_, __) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const ShimmerBox(width: double.infinity, height: 100, radius: 12),
            const SizedBox(height: 8),
            const ShimmerBox(width: double.infinity, height: 14),
            const SizedBox(height: 6),
            ShimmerBox(width: MediaQuery.of(context).size.width * 0.4, height: 12),
          ],
        ),
      ),
    );
  }
}

class ShimmerProviderDetail extends StatelessWidget {
  const ShimmerProviderDetail({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const ShimmerBox(width: double.infinity, height: 220, radius: 0),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const ShimmerBox(width: double.infinity, height: 20),
                  const SizedBox(height: 8),
                  ShimmerBox(width: MediaQuery.of(context).size.width * 0.4, height: 14),
                  const SizedBox(height: 24),
                  const ShimmerBox(width: 120, height: 18),
                  const SizedBox(height: 12),
                  ...List.generate(3, (_) => const Padding(
                    padding: EdgeInsets.only(bottom: 12),
                    child: ShimmerBox(width: double.infinity, height: 72, radius: 12),
                  )),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ShimmerBookingCard extends StatelessWidget {
  const ShimmerBookingCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const ShimmerBox(width: 120, height: 16),
                const ShimmerBox(width: 80, height: 24, radius: 12),
              ],
            ),
            const SizedBox(height: 12),
            const ShimmerBox(width: double.infinity, height: 14),
            const SizedBox(height: 8),
            ShimmerBox(width: MediaQuery.of(context).size.width * 0.6, height: 12),
            const SizedBox(height: 8),
            ShimmerBox(width: MediaQuery.of(context).size.width * 0.4, height: 12),
          ],
        ),
      ),
    );
  }
}

class ShimmerBookingList extends StatelessWidget {
  final int itemCount;

  const ShimmerBookingList({super.key, this.itemCount = 3});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: itemCount,
      itemBuilder: (_, __) => const ShimmerBookingCard(),
    );
  }
}
