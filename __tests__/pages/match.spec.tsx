import { render, screen } from '@testing-library/react';
import { GameScoreContext } from '../../context/GameScoreContext';
import { OversContext } from '../../context/GameContext';
import type { GameScore, GameScoreContextType, OversContextType } from '../../context/GameContext';
import MatchPage from '../../pages/match';

jest.mock('next/router', () => ({
  useRouter: () => ({ asPath: '/match' }),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

jest.mock('../../context/MostRecentActionContext', () => ({
  useMostRecentAction: () => ({ mostRecentAction: { runs: 0, action: null }, setMostRecentAction: jest.fn() }),
}));

jest.mock('../../utils/useMilestone', () => ({
  useMilestone: () => null,
}));

jest.mock('../../components/scoring/scoring', () => ({
  __esModule: true,
  default: () => <div data-testid="scoring" />,
}));

const emptyGameScoreContext: GameScoreContextType = {
  gameScore: [] as unknown as GameScore,
  setGameScore: jest.fn(),
  setBattingPlayerScore: jest.fn(),
  setBowlingPlayerScore: jest.fn(),
  swapBatsmen: jest.fn(),
  setCurrentBowler: jest.fn(),
  undo: jest.fn(),
  canUndo: false,
};

const defaultOversContext: OversContextType = {
  currentOver: 1,
  currentBallInThisOver: 1,
  currentExtrasInThisOver: 0,
  setCurrentOvers: jest.fn(),
  setCurrentBallInThisOver: jest.fn(),
  setCurrentExtrasInThisOver: jest.fn(),
  resetOvers: jest.fn(),
};

const renderMatch = (
  gameScoreOverrides?: Partial<GameScoreContextType>,
  oversOverrides?: Partial<OversContextType>
) =>
  render(
    <GameScoreContext.Provider value={{ ...emptyGameScoreContext, ...gameScoreOverrides }}>
      <OversContext.Provider value={{ ...defaultOversContext, ...oversOverrides }}>
        <MatchPage />
      </OversContext.Provider>
    </GameScoreContext.Provider>
  );

describe('MatchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('empty state (no active match)', () => {
    it('renders "No active match found" when there is no game in progress', () => {
      renderMatch();
      expect(screen.getByText('No active match found.')).toBeInTheDocument();
    });

    it('renders a link to start a new match on the home page', () => {
      renderMatch();
      const link = screen.getByRole('link', { name: /start a new match/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/');
    });

    it('renders the page heading', () => {
      renderMatch();
      expect(screen.getByRole('heading', { name: /today's match/i })).toBeInTheDocument();
    });
  });
});
