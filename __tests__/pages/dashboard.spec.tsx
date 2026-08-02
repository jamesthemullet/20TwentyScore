import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { GameScoreContext } from '../../context/GameScoreContext';
import type { GameScore, GameScoreContextType } from '../../context/GameContext';
import DashboardPage from '../../pages/dashboard';

type DashboardProps = ComponentProps<typeof DashboardPage>;

jest.mock('next/router', () => ({
  useRouter: () => ({ query: {}, asPath: '/dashboard', push: jest.fn() }),
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
jest.mock('../../lib/prisma', () => ({ prisma: {} }));
jest.mock('../../lib/gameSaveTitle', () => ({ generateSaveTitle: jest.fn(() => 'Test Save') }));

jest.mock('../../components/premium/UpgradeCTA', () => ({
  __esModule: true,
  default: () => <div data-testid="upgrade-cta" />,
}));

jest.mock('../../components/saves/SaveCard', () => ({
  __esModule: true,
  default: ({ title }: { title: string | null }) => <div data-testid="save-card">{title}</div>,
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
  });
});
