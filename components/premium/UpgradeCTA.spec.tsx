import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import UpgradeCTA from './UpgradeCTA';

describe('UpgradeCTA', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('renders the title, description, and pricing options', () => {
    render(<UpgradeCTA />);
    expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument();
    expect(screen.getByText(/unlimited cloud saves/i)).toBeInTheDocument();
    expect(screen.getByText('£2.99')).toBeInTheDocument();
    expect(screen.getByText('£9.99')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subscribe monthly/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subscribe annually/i })).toBeInTheDocument();
  });

  it('shows "Save 72%" badge for the annual plan', () => {
    render(<UpgradeCTA />);
    expect(screen.getByText(/save 72%/i)).toBeInTheDocument();
  });

  it('disables both buttons and changes label to "Redirecting…" on the clicked plan while loading', async () => {
    (global.fetch as jest.Mock).mockReturnValue(new Promise(() => {})); // never resolves
    process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID = 'price_monthly';

    render(<UpgradeCTA />);
    fireEvent.click(screen.getByRole('button', { name: /subscribe monthly/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /redirecting/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /subscribe annually/i })).toBeDisabled();
    });
  });

  it('posts the priceId to /api/stripe/create-checkout-session', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ url: '' }),
    });
    process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID = 'price_annual';

    render(<UpgradeCTA />);
    fireEvent.click(screen.getByRole('button', { name: /subscribe annually/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/stripe/create-checkout-session',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ priceId: 'price_annual' }),
        })
      );
    });
  });
});
