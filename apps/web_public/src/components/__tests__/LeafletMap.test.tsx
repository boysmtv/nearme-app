import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockMap, mockTileLayer, mockMarker, mockCircle, mockDivIcon, mockZoomControl } = vi.hoisted(() => {
  const mockMap = vi.fn(() => ({
    addLayer: vi.fn(),
    remove: vi.fn(),
    setView: vi.fn(),
  }));
  const mockTileLayer = vi.fn(() => ({ addTo: vi.fn().mockReturnThis() }));
  const mockMarker = vi.fn(() => ({
    addTo: vi.fn().mockReturnThis(),
    bindPopup: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  }));
  const mockCircle = vi.fn(() => ({ addTo: vi.fn().mockReturnThis() }));
  const mockDivIcon = vi.fn(() => ({ className: 'mock-icon' }));
  const mockZoomControl = vi.fn(() => ({ addTo: vi.fn() }));
  return { mockMap, mockTileLayer, mockMarker, mockCircle, mockDivIcon, mockZoomControl };
});

vi.mock('leaflet', () => ({
  default: {
    map: mockMap,
    tileLayer: mockTileLayer,
    marker: mockMarker,
    circle: mockCircle,
    divIcon: mockDivIcon,
    control: { zoom: mockZoomControl },
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

  it('initializes map with correct center and zoom', () => {
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} zoom={16} />);
    expect(mockMap).toHaveBeenCalled();
    expect(mockTileLayer).toHaveBeenCalled();
  });

  it('creates user location marker with red icon', () => {
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} />);
    expect(mockDivIcon).toHaveBeenCalled();
    const divIconCalls = mockDivIcon.mock.calls;
    const userIcon = divIconCalls.find((call: any[]) => call[0]?.className === 'user-marker');
    expect(userIcon).toBeTruthy();
  });

  it('creates radius circle', () => {
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} radius={10} />);
    expect(mockCircle).toHaveBeenCalled();
    const circleCall = mockCircle.mock.calls[0];
    expect(circleCall[0]).toEqual([-6.2, 106.8]);
    expect(circleCall[1].radius).toBe(10000);
  });

  it('adds zoom control', () => {
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} />);
    expect(mockZoomControl).toHaveBeenCalled();
  });

  it('renders provider markers when providers have coordinates', () => {
    const providers = [
      { id: 'p1', name: 'Barber A', lat: -6.21, lng: 106.81, category: 'Barbershop' },
      { id: 'p2', name: 'Salon B', lat: -6.22, lng: 106.82, category: 'Salon' },
    ];
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} providers={providers} />);
    expect(mockMarker).toHaveBeenCalledTimes(3);
  });

  it('skips providers without lat/lng', () => {
    const providers = [
      { id: 'p1', name: 'Barber A', lat: -6.21, lng: 106.81 },
      { id: 'p2', name: 'No Coords' },
    ];
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} providers={providers} />);
    expect(mockMarker).toHaveBeenCalledTimes(2); // 1 user + 1 provider with coords
  });

  it('creates provider icon with category color', () => {
    const providers = [
      { id: 'p1', name: 'Barber', lat: -6.21, lng: 106.81, category: 'Barbershop' },
    ];
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} providers={providers} />);
    const providerIconCall = mockDivIcon.mock.calls.find(
      (call: any[]) => call[0]?.className === 'custom-marker',
    );
    expect(providerIconCall).toBeTruthy();
    expect(providerIconCall[0].html).toContain('#3b82f6');
  });

  it('uses default color for unknown category', () => {
    const providers = [
      { id: 'p1', name: 'Other', lat: -6.21, lng: 106.81, category: 'Unknown' },
    ];
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} providers={providers} />);
    const providerIconCall = mockDivIcon.mock.calls.find(
      (call: any[]) => call[0]?.className === 'custom-marker',
    );
    expect(providerIconCall).toBeTruthy();
    expect(providerIconCall[0].html).toContain('#6C63FF');
  });

  it('uses Salon color for Salon category', () => {
    const providers = [
      { id: 'p1', name: 'Salon', lat: -6.21, lng: 106.81, category: 'Salon' },
    ];
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} providers={providers} />);
    const providerIconCall = mockDivIcon.mock.calls.find(
      (call: any[]) => call[0]?.className === 'custom-marker',
    );
    expect(providerIconCall[0].html).toContain('#ec4899');
  });

  it('uses Kecantikan color', () => {
    const providers = [
      { id: 'p1', name: 'Kec', lat: -6.21, lng: 106.81, category: 'Kecantikan' },
    ];
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} providers={providers} />);
    const providerIconCall = mockDivIcon.mock.calls.find(
      (call: any[]) => call[0]?.className === 'custom-marker',
    );
    expect(providerIconCall[0].html).toContain('#a855f7');
  });

  it('uses Spa color', () => {
    const providers = [
      { id: 'p1', name: 'Spa', lat: -6.21, lng: 106.81, category: 'Spa' },
    ];
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} providers={providers} />);
    const providerIconCall = mockDivIcon.mock.calls.find(
      (call: any[]) => call[0]?.className === 'custom-marker',
    );
    expect(providerIconCall[0].html).toContain('#14b8a6');
  });

  it('uses default color for no category', () => {
    const providers = [
      { id: 'p1', name: 'No Cat', lat: -6.21, lng: 106.81 },
    ];
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} providers={providers} />);
    const providerIconCall = mockDivIcon.mock.calls.find(
      (call: any[]) => call[0]?.className === 'custom-marker',
    );
    expect(providerIconCall[0].html).toContain('#6C63FF');
  });

  it('binds popup with provider name', () => {
    const providers = [
      { id: 'p1', name: 'Test Shop', lat: -6.21, lng: 106.81, category: 'Barbershop', rating: 4.5 },
    ];
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} providers={providers} />);
    const providerMarker = mockMarker.mock.results[1].value;
    expect(providerMarker.bindPopup).toHaveBeenCalled();
    const popupHtml = providerMarker.bindPopup.mock.calls[0][0];
    expect(popupHtml).toContain('Test Shop');
    expect(popupHtml).toContain('Barbershop');
    expect(popupHtml).toContain('4.5');
  });

  it('binds popup with distance when provided', () => {
    const providers = [
      { id: 'p1', name: 'Near Shop', lat: -6.21, lng: 106.81, distance: 1.5 },
    ];
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} providers={providers} />);
    const providerMarker = mockMarker.mock.results[1].value;
    const popupHtml = providerMarker.bindPopup.mock.calls[0][0];
    expect(popupHtml).toContain('1.5 km');
  });

  it('calls onProviderClick when marker is clicked', () => {
    const onProviderClick = vi.fn();
    const providers = [
      { id: 'p1', name: 'Click Shop', lat: -6.21, lng: 106.81 },
    ];
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} providers={providers} onProviderClick={onProviderClick} />);
    const providerMarker = mockMarker.mock.results[1].value;
    expect(providerMarker.on).toHaveBeenCalledWith('click', expect.any(Function));
    const clickHandler = providerMarker.on.mock.calls.find((call: any[]) => call[0] === 'click')[1];
    act(() => {
      clickHandler();
    });
    expect(onProviderClick).toHaveBeenCalledWith(providers[0]);
  });

  it('does not register click handler when onProviderClick is not provided', () => {
    const providers = [
      { id: 'p1', name: 'No Click', lat: -6.21, lng: 106.81 },
    ];
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} providers={providers} />);
    const providerMarker = mockMarker.mock.results[1].value;
    expect(providerMarker.on).not.toHaveBeenCalled();
  });

  it('sets default zoom to 14', () => {
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} />);
    expect(mockMap).toHaveBeenCalled();
  });

  it('sets custom zoom', () => {
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} zoom={18} />);
    expect(mockMap).toHaveBeenCalled();
  });

  it('sets default radius to 5km', () => {
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} />);
    expect(mockCircle).toHaveBeenCalled();
    expect(mockCircle.mock.calls[0][1].radius).toBe(5000);
  });

  it('binds user location popup', () => {
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} />);
    const userMarkerInstance = mockMarker.mock.results[0].value;
    expect(userMarkerInstance.bindPopup).toHaveBeenCalledWith('Lokasi Anda');
  });

  it('renders without providers', () => {
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} providers={[]} />);
    expect(mockMarker).toHaveBeenCalledTimes(1);
  });

  it('popup shows rating with star icon', () => {
    const providers = [
      { id: 'p1', name: 'Rated', lat: -6.21, lng: 106.81, rating: 4.8 },
    ];
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} providers={providers} />);
    const providerMarker = mockMarker.mock.results[1].value;
    const popupHtml = providerMarker.bindPopup.mock.calls[0][0];
    expect(popupHtml).toContain('9733');
    expect(popupHtml).toContain('4.8');
  });

  it('popup handles distance as string', () => {
    const providers = [
      { id: 'p1', name: 'Far', lat: -6.21, lng: 106.81, distance: '2.3 km' as any },
    ];
    render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} providers={providers} />);
    const providerMarker = mockMarker.mock.results[1].value;
    const popupHtml = providerMarker.bindPopup.mock.calls[0][0];
    expect(popupHtml).toContain('2.3 km');
  });

  it('cleans up map on unmount', () => {
    const { unmount } = render(<LeafletMap center={{ lat: -6.2, lng: 106.8 }} />);
    const mapInstance = mockMap.mock.results[0].value;
    unmount();
    expect(mapInstance.remove).toHaveBeenCalled();
  });
});
