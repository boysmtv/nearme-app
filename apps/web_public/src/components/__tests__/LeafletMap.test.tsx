import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => ({
      addLayer: vi.fn(),
      remove: vi.fn(),
      setView: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({ addTo: vi.fn().mockReturnThis() })),
    marker: vi.fn(() => ({
      addTo: vi.fn().mockReturnThis(),
      bindPopup: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    })),
    circle: vi.fn(() => ({ addTo: vi.fn().mockReturnThis() })),
    divIcon: vi.fn(() => ({ className: 'mock-icon' })),
    control: { zoom: vi.fn(() => ({ addTo: vi.fn() })) },
  },
}));

vi.mock('leaflet/dist/leaflet.css', () => ({}));

import LeafletMap from '../LeafletMap';

describe('LeafletMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a map container div', () => {
    const { container } = render(
      <LeafletMap center={{ lat: -6.2, lng: 106.8 }} />,
    );
    const div = container.querySelector('.w-full.h-full');
    expect(div).toBeInTheDocument();
  });

  it('accepts className prop', () => {
    const { container } = render(
      <LeafletMap center={{ lat: -6.2, lng: 106.8 }} className="test-class" />,
    );
    const div = container.querySelector('.test-class');
    expect(div).toBeInTheDocument();
  });
});
