import { render, screen, waitFor } from '@testing-library/react';
import { AccountProvider, useAccount } from './AccountContext';

const mockUseSession = jest.fn();

jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

function AccountDisplay() {
  const { tier, isLoading, user, subscription } = useAccount();
  return (
    <div>
      <span data-testid="tier">{tier}</span>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user?.name ?? 'none'}</span>
      <span data-testid="subscription">{subscription?.status ?? 'none'}</span>
    </div>
  );
}

function renderProvider() {
  return render(
    <AccountProvider>
      <AccountDisplay />
    </AccountProvider>
  );
}

describe('AccountProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('exposes default free tier and no user when session is loading', () => {
    mockUseSession.mockReturnValue({ status: 'loading' });
    renderProvider();
    expect(screen.getByTestId('tier').textContent).toBe('free');
    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(screen.getByTestId('subscription').textContent).toBe('none');
  });

  it('resets to free tier and clears user when unauthenticated', () => {
    mockUseSession.mockReturnValue({ status: 'unauthenticated' });
    renderProvider();
    expect(screen.getByTestId('tier').textContent).toBe('free');
    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(screen.getByTestId('subscription').textContent).toBe('none');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches /api/account and populates tier and subscription when authenticated', async () => {
    mockUseSession.mockReturnValue({ status: 'authenticated' });
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        user: { name: 'Alice', id: 'u1' },
        tier: 'premium',
        subscription: { status: 'active' },
      }),
    });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('tier').textContent).toBe('premium');
    });
    expect(screen.getByTestId('user').textContent).toBe('Alice');
    expect(screen.getByTestId('subscription').textContent).toBe('active');
    expect(global.fetch).toHaveBeenCalledWith('/api/account');
  });
});
