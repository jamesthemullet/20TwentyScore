import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getServerSession } from 'next-auth/next';
import type { ComponentProps } from 'react';
import { GameScoreContext } from '../../context/GameScoreContext';
import type { GameScore, GameScoreContextType } from '../../context/GameContext';
import DashboardPage, { getServerSideProps } from '../../pages/dashboard';
import { getUserTier } from '../../lib/subscription';
import { syncSubscriptionForUser } from '../../lib/syncSubscription';
import { prisma } from '../../lib/prisma';

type DashboardProps = ComponentProps<typeof DashboardPage>;

const mockRouterReplace = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({ query: {}, asPath: '/dashboard', push: jest.fn(), replace: mockRouterReplace }),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// next-auth/next pulls in jose and openid-client (ESM-only); mock the whole module
// so Jest does not attempt to parse it.
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('../../lib/authOptions', () => ({ authOptions: {} }));
jest.mock('../../lib/subscription', () => ({ getUserTier: jest.fn() }));
jest.mock('../../lib/syncSubscription', () => ({ syncSubscriptionForUser: jest.fn() }));
jest.mock('../../lib/prisma', () => ({
  prisma: { gameSave: { findMany: jest.fn() }, season: { findMany: jest.fn() } },
}));
jest.mock('../../lib/gameSaveTitle', () => ({ generateSaveTitle: jest.fn(() => 'Test Save') }));

jest.mock('../../components/premium/UpgradeCTA', () => ({
  __esModule: true,
  default: () => <div data-testid="upgrade-cta" />,
}));

jest.mock('../../components/saves/SaveCard', () => ({
  __esModule: true,
  default: ({
    id,
    title,
    seasonId,
    seasons,
    onSeasonChange,
  }: {
    id: string;
    title: string | null;
    seasonId?: string | null;
    seasons?: { id: string; name: string }[];
    onSeasonChange?: (saveId: string, seasonId: string | null) => void;
  }) => (
    <div data-testid="save-card">
      {title}
      <span data-testid="save-card-season">{seasonId ?? ''}</span>
      {seasons && onSeasonChange && (
        <button type="button" onClick={() => onSeasonChange(id, seasons[0].id)}>
          Assign season
        </button>
      )}
    </div>
  ),
}));

const { useSession } = jest.requireMock<{ useSession: jest.Mock }>('next-auth/react');

const emptyContext: GameScoreContextType = {
  gameScore: [] as unknown as GameScore,
  setGameScore: jest.fn(),
  setBattingPlayerScore: jest.fn(),
  setBowlingPlayerScore: jest.fn(),
  swapBatsmen: jest.fn(),
  setCurrentBowler: jest.fn(),
  undo: jest.fn(),
  canUndo: false,
};

const defaultProps: DashboardProps = {
  tier: 'free',
  initialSaves: [],
  initialSeasons: [],
  checkoutSuccess: false,
};

const renderDashboard = (props: DashboardProps = defaultProps) =>
  render(
    <GameScoreContext.Provider value={emptyContext}>
      <DashboardPage {...props} />
    </GameScoreContext.Provider>
  );

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('unauthenticated', () => {
    beforeEach(() => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    });

    it('prompts the user to sign in', () => {
      renderDashboard();
      expect(screen.getByText(/please/i)).toBeInTheDocument();
      const signInLinks = screen.getAllByRole('link', { name: /sign in/i });
      expect(signInLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('renders the Dashboard heading', () => {
      renderDashboard();
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });
  });

  describe('authenticated — free tier', () => {
    beforeEach(() => {
      useSession.mockReturnValue({
        data: { user: { name: 'Alice Smith', email: 'alice@example.com', image: null } },
        status: 'authenticated',
      });
    });

    it('shows the user name and email', () => {
      renderDashboard();
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    });

    it('shows a Free tier badge', () => {
      renderDashboard();
      expect(screen.getByText('Free')).toBeInTheDocument();
    });

    it('shows the empty saves message when there are no saves', () => {
      renderDashboard();
      expect(screen.getByText(/no cloud saves yet/i)).toBeInTheDocument();
    });

    it('renders the session avatar image when one is available', () => {
      useSession.mockReturnValue({
        data: { user: { name: 'Alice Smith', email: 'alice@example.com', image: 'https://example.com/avatar.png' } },
        status: 'authenticated',
      });
      renderDashboard();
      expect(screen.getAllByRole('img', { name: 'Alice Smith' }).length).toBeGreaterThanOrEqual(1);
    });

    it('falls back to an empty alt when the avatar image has no session name', () => {
      useSession.mockReturnValue({
        data: { user: { name: undefined, email: 'alice@example.com', image: 'https://example.com/avatar.png' } },
        status: 'authenticated',
      });
      const { container } = renderDashboard();
      const images = container.querySelectorAll('img[alt=""]');
      expect(images.length).toBeGreaterThanOrEqual(1);
    });

    it('falls back to "?" initials when there is no image and no session name', () => {
      useSession.mockReturnValue({
        data: { user: { name: undefined, email: 'alice@example.com', image: null } },
        status: 'authenticated',
      });
      renderDashboard();
      expect(screen.getAllByText('?').length).toBeGreaterThanOrEqual(1);
    });

    it('renders save cards when saves are present', () => {
      renderDashboard({
        ...defaultProps,
        initialSaves: [
          { id: 'save-1', title: 'Runswick CC vs Thornton', createdAt: '2026-01-01T00:00:00.000Z', completed: true, seasonId: null },
        ],
      });
      expect(screen.getByTestId('save-card')).toBeInTheDocument();
      expect(screen.getByText('Runswick CC vs Thornton')).toBeInTheDocument();
    });

    it('shows the UpgradeCTA and locked seasons section for free users', () => {
      renderDashboard();
      expect(screen.getByTestId('upgrade-cta')).toBeInTheDocument();
    });
  });

  describe('authenticated — premium tier', () => {
    beforeEach(() => {
      useSession.mockReturnValue({
        data: { user: { name: 'Bob Jones', email: 'bob@example.com', image: null } },
        status: 'authenticated',
      });
    });

    it('shows a Premium tier badge', () => {
      renderDashboard({ ...defaultProps, tier: 'premium' });
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('shows a link to the Seasons page for premium users', () => {
      renderDashboard({ ...defaultProps, tier: 'premium' });
      const link = screen.getByRole('link', { name: /view seasons/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/seasons');
    });

    it('does not render the UpgradeCTA for premium users', () => {
      renderDashboard({ ...defaultProps, tier: 'premium' });
      expect(screen.queryByTestId('upgrade-cta')).not.toBeInTheDocument();
    });

    it('assigns a save to a season via onSeasonChange', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      renderDashboard({
        ...defaultProps,
        tier: 'premium',
        initialSaves: [
          { id: 'save-1', title: 'Runswick CC vs Thornton', createdAt: '2026-01-01T00:00:00.000Z', completed: true, seasonId: null },
          { id: 'save-2', title: 'Other Match', createdAt: '2026-01-02T00:00:00.000Z', completed: true, seasonId: null },
        ],
        initialSeasons: [{ id: 'season-1', name: 'Summer 2026' }],
      });

      const [assignFirst] = screen.getAllByRole('button', { name: /assign season/i });
      fireEvent.click(assignFirst);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/saves/save-1', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seasonId: 'season-1' }),
        });
      });
      const seasonCells = await screen.findAllByTestId('save-card-season');
      expect(seasonCells[0]).toHaveTextContent('season-1');
      expect(seasonCells[1]).toHaveTextContent('');
    });

    it('does not update the save list when assigning a season fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false });

      renderDashboard({
        ...defaultProps,
        tier: 'premium',
        initialSaves: [
          { id: 'save-1', title: 'Runswick CC vs Thornton', createdAt: '2026-01-01T00:00:00.000Z', completed: true, seasonId: null },
        ],
        initialSeasons: [{ id: 'season-1', name: 'Summer 2026' }],
      });

      fireEvent.click(screen.getByRole('button', { name: /assign season/i }));

      await waitFor(() => expect(global.fetch).toHaveBeenCalled());
      expect(screen.getByTestId('save-card-season')).toHaveTextContent('');
    });
  });

  describe('checkout success URL cleanup', () => {
    beforeEach(() => {
      useSession.mockReturnValue({
        data: { user: { name: 'Alice Smith', email: 'alice@example.com', image: null } },
        status: 'authenticated',
      });
    });

    it('replaces the URL to strip ?checkout=success without a full reload', () => {
      renderDashboard({ ...defaultProps, checkoutSuccess: true });
      expect(mockRouterReplace).toHaveBeenCalledWith('/dashboard', undefined, { shallow: true });
      expect(screen.getByRole('status')).toHaveTextContent(/welcome to premium/i);
    });

    it('does not replace the URL again on re-render', () => {
      const { rerender } = renderDashboard({ ...defaultProps, checkoutSuccess: true });
      mockRouterReplace.mockClear();
      rerender(
        <GameScoreContext.Provider value={emptyContext}>
          <DashboardPage {...defaultProps} checkoutSuccess={true} />
        </GameScoreContext.Provider>,
      );
      expect(mockRouterReplace).not.toHaveBeenCalled();
    });
  });

  describe('saveToCloud', () => {
    beforeEach(() => {
      useSession.mockReturnValue({
        data: { user: { name: 'Alice Smith', email: 'alice@example.com', image: null } },
        status: 'authenticated',
      });
      localStorage.setItem('gameData', JSON.stringify({ some: 'game' }));
    });

    it('creates a new cloud save and shows a success message', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ id: 'save-new', title: 'Test Save', createdAt: '2026-01-01T00:00:00.000Z', completed: false, seasonId: null }),
      });

      renderDashboard();
      fireEvent.click(screen.getByRole('button', { name: /save current game to cloud/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/saves', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameData: [], title: 'Test Save' }),
        });
      });
      expect(await screen.findByText(/game saved!/i)).toBeInTheDocument();
      expect(localStorage.getItem('cloudSaveId')).toBe('save-new');
      expect(screen.getByTestId('save-card')).toBeInTheDocument();
    });

    it('updates an existing cloud save when a cloudSaveId is already stored', async () => {
      localStorage.setItem('cloudSaveId', 'save-existing');
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: 'save-existing', title: 'Test Save', createdAt: '2026-01-01T00:00:00.000Z', completed: false, seasonId: null }),
      });

      renderDashboard({
        ...defaultProps,
        initialSaves: [
          { id: 'save-existing', title: 'Old title', createdAt: '2026-01-01T00:00:00.000Z', completed: false, seasonId: null },
          { id: 'save-other', title: 'Untouched', createdAt: '2026-01-02T00:00:00.000Z', completed: true, seasonId: null },
        ],
      });
      fireEvent.click(screen.getByRole('button', { name: /save current game to cloud/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/saves/save-existing', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameData: [], title: 'Test Save' }),
        });
      });
      expect(await screen.findByText(/game saved!/i)).toBeInTheDocument();
      expect(screen.getAllByTestId('save-card')).toHaveLength(2);
      expect(screen.getByText('Untouched')).toBeInTheDocument();
    });

    it('shows an upgrade prompt when the free save limit is reached', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 402 });

      renderDashboard();
      fireEvent.click(screen.getByRole('button', { name: /save current game to cloud/i }));

      expect(await screen.findByText(/reached the free save limit/i)).toBeInTheDocument();
    });

    it('shows a generic error message when the request fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });

      renderDashboard();
      fireEvent.click(screen.getByRole('button', { name: /save current game to cloud/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i);
    });

    it('shows a generic error message when the request throws', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

      renderDashboard();
      fireEvent.click(screen.getByRole('button', { name: /save current game to cloud/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i);
    });
  });
});

describe('getServerSideProps', () => {
  const context = { req: {}, res: {}, query: {} } as unknown as Parameters<typeof getServerSideProps>[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to sign-in when there is no session', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const result = await getServerSideProps(context);
    expect(result).toEqual({ redirect: { destination: '/auth/signin', permanent: false } });
  });

  it('returns free-tier props with no seasons fetched', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (getUserTier as jest.Mock).mockResolvedValue('free');
    (prisma.gameSave.findMany as jest.Mock).mockResolvedValue([
      { id: 's1', title: 'A save', createdAt: new Date('2026-01-01T00:00:00.000Z'), completed: true, seasonId: null },
    ]);

    const result = await getServerSideProps(context);

    expect(prisma.season.findMany).not.toHaveBeenCalled();
    expect(result).toEqual({
      props: {
        tier: 'free',
        initialSaves: [
          { id: 's1', title: 'A save', createdAt: '2026-01-01T00:00:00.000Z', completed: true, seasonId: null },
        ],
        initialSeasons: [],
        checkoutSuccess: false,
      },
    });
  });

  it('returns premium-tier props including fetched seasons', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (getUserTier as jest.Mock).mockResolvedValue('premium');
    (prisma.gameSave.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.season.findMany as jest.Mock).mockResolvedValue([{ id: 'season-1', name: 'Summer 2026' }]);

    const result = await getServerSideProps({ ...context, query: {} } as unknown as Parameters<typeof getServerSideProps>[0]);

    expect(prisma.season.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1' } }),
    );
    expect(result).toEqual({
      props: {
        tier: 'premium',
        initialSaves: [],
        initialSeasons: [{ id: 'season-1', name: 'Summer 2026' }],
        checkoutSuccess: false,
      },
    });
  });

  it('syncs the subscription on a successful checkout redirect', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (getUserTier as jest.Mock).mockResolvedValue('premium');
    (prisma.gameSave.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.season.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getServerSideProps({
      ...context,
      query: { checkout: 'success' },
    } as unknown as Parameters<typeof getServerSideProps>[0]);

    expect(syncSubscriptionForUser).toHaveBeenCalledWith('u1');
    expect(result).toMatchObject({ props: { checkoutSuccess: true } });
  });

  it('still returns props when syncing the subscription throws', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (getUserTier as jest.Mock).mockResolvedValue('free');
    (prisma.gameSave.findMany as jest.Mock).mockResolvedValue([]);
    (syncSubscriptionForUser as jest.Mock).mockRejectedValue(new Error('stripe down'));

    const result = await getServerSideProps({
      ...context,
      query: { checkout: 'success' },
    } as unknown as Parameters<typeof getServerSideProps>[0]);

    expect(result).toMatchObject({ props: { tier: 'free', checkoutSuccess: true } });
  });
});
