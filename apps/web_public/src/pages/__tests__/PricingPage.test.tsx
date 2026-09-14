import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import PricingPage from '../PricingPage';

vi.mock('../../components/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

vi.mock('../../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

function renderPricing() {
  return render(
    <MemoryRouter>
      <PricingPage />
    </MemoryRouter>
  );
}

describe('PricingPage', () => {
  it('renders heading', () => {
    renderPricing();
    expect(screen.getByRole('heading', { name: /paket harga/i })).toBeInTheDocument();
  });

  it('renders all three plans', () => {
    renderPricing();
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('renders plan prices', () => {
    renderPricing();
    expect(screen.getByText('Gratis')).toBeInTheDocument();
    expect(screen.getByText('Rp 199.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 499.000')).toBeInTheDocument();
  });

  it('renders CTA buttons with links', () => {
    renderPricing();
    expect(screen.getByText('Mulai Gratis')).toBeInTheDocument();
    expect(screen.getByText('Pilih Pro')).toBeInTheDocument();
    expect(screen.getByText('Hubungi Kami')).toBeInTheDocument();
  });
});
