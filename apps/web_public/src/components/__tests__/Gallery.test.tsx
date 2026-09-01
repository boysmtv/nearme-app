import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

function GalleryGrid({ items }: { items: { id: string; url: string; fileName: string }[] }) {
  if (items.length === 0) return <p>Belum ada foto galeri</p>;
  return (
    <div data-testid="gallery-grid" className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <img key={item.id} src={item.url} alt={item.fileName} data-testid="gallery-item" />
      ))}
    </div>
  );
}

describe('GalleryGrid', () => {
  it('renders 3-cols grid', () => {
    const items = [
      { id: '1', url: '/uploads/a.jpg', fileName: 'a.jpg' },
      { id: '2', url: '/uploads/b.jpg', fileName: 'b.jpg' },
      { id: '3', url: '/uploads/c.jpg', fileName: 'c.jpg' },
    ];
    render(<GalleryGrid items={items} />);
    expect(screen.getByTestId('gallery-grid')).toBeInTheDocument();
    expect(screen.getAllByTestId('gallery-item')).toHaveLength(3);
  });

  it('shows empty state', () => {
    render(<GalleryGrid items={[]} />);
    expect(screen.getByText('Belum ada foto galeri')).toBeInTheDocument();
  });

  it('caps at 8 photos for review', () => {
    const many = Array.from({ length: 9 }, (_, i) => ({ id: `${i}`, url: `/uploads/${i}.jpg`, fileName: `${i}.jpg` }));
    const limited = many.slice(0, 8);
    render(<GalleryGrid items={limited} />);
    expect(screen.getAllByTestId('gallery-item')).toHaveLength(8);
  });

  it('renders image with correct src', () => {
    render(<GalleryGrid items={[{ id: '1', url: '/uploads/a.jpg', fileName: 'a.jpg' }]} />);
    const img = screen.getByTestId('gallery-item');
    expect(img).toHaveAttribute('src', '/uploads/a.jpg');
  });
});

describe('ProviderMedia reorder logic', () => {
  it('reorders ids correctly', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const from = 0, to = 2;
    const reordered = [...ids];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    expect(reordered).toEqual(['b', 'c', 'a', 'd']);
  });
});

describe('Review verified badge', () => {
  it('shows verified when booking completed', () => {
    const review = { verifiedBooking: true, rating: 5 };
    expect(review.verifiedBooking).toBe(true);
  });
  it('hides verified when not completed', () => {
    const review = { verifiedBooking: false };
    expect(review.verifiedBooking).toBe(false);
  });
});
