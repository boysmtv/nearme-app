String formatRupiah(num amount) {
  final value = amount.round().toString().replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
        (m) => '${m[1]}.',
      );
  return 'Rp $value';
}
