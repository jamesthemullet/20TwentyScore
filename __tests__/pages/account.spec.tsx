import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getServerSession } from 'next-auth/next';
import { signOut } from 'next-auth/react';
import AccountPage, { getServerSideProps } from '../../pages/account';
import { getUserTier } from '../../lib/subscription';
import { prisma } from '../../lib/prisma';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/account', query: {}, asPath: '/account', push: jest.fn() }),
}));

jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
  useSession: jest.fn().mockReturnValue({ data: null, status: 'unauthenticated' }),
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('../../lib/authOptions', () => ({ authOptions: {} }));
jest.mock('../../lib/subscription', () => ({ getUserTier: jest.fn() }));
jest.mock('../../lib/prisma', () => ({
  prisma: { subscription: { findUnique: jest.fn() } },
}));

jest.mock('../../components/premium/UpgradeCTA', () => ({
  __esModule: true,
  default: () => <div data-testid="upgrade-cta" />,
}));

describe('AccountPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Account heading', () => {
    render(<AccountPage tier="free" subscription={null} />);
    expect(screen.getByRole('heading', { name: /account/i })).toBeInTheDocument();
  });

  it('shows a Free badge and UpgradeCTA for free tier users', () => {
    render(<AccountPage tier="free" subscription={null} />);
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-cta')).toBeInTheDocument();
  });

  it('shows a Premium badge and Manage Billing button for premium tier users', () => {
    render(<AccountPage tier="premium" subscription={{ status: 'active', plan: 'Monthly' }} />);
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /manage billing/i })).toBeInTheDocument();
    expect(screen.queryByTestId('upgrade-cta')).not.toBeInTheDocument();
  });

  it('signs the user out with a callback to the home page', () => {
    render(<AccountPage tier="free" subscription={null} />);
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  describe('openBillingPortal', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('redirects to the billing portal URL on success', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'https://billing.stripe.com/session/abc' }),
      });

      render(<AccountPage tier="premium" subscription={{ status: 'active', plan: 'Monthly' }} />);
      fireEvent.click(screen.getByRole('button', { name: /manage billing/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/stripe/create-portal-session', {
          method: 'POST',
        });
      });
    });

    it('shows an error message when the request fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

      render(<AccountPage tier="premium" subscription={{ status: 'active', plan: 'Monthly' }} />);
      fireEvent.click(screen.getByRole('button', { name: /manage billing/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent(
        /could not open billing portal/i,
      );
    });

    it('shows a generic error message when the request throws', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('network down'));

      render(<AccountPage tier="premium" subscription={{ status: 'active', plan: 'Monthly' }} />);
      fireEvent.click(screen.getByRole('button', { name: /manage billing/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i);
    });
  });
});

describe('getServerSideProps', () => {
  const context = { req: {}, res: {} } as Parameters<typeof getServerSideProps>[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to sign-in when there is no session', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const result = await getServerSideProps(context);
    expect(result).toEqual({ redirect: { destination: '/auth/signin', permanent: false } });
  });

  it('returns the tier and subscription for an authenticated user', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (getUserTier as jest.Mock).mockResolvedValue('premium');
    (prisma.subscription.findUnique as jest.Mock).mockResolvedValue({
      status: 'active',
      plan: 'Monthly',
    });

    const result = await getServerSideProps(context);

    expect(prisma.subscription.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1' } }),
    );
    expect(result).toEqual({
      props: {
        tier: 'premium',
        subscription: { status: 'active', plan: 'Monthly' },
      },
    });
  });
});
