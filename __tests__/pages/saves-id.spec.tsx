import { render, screen } from '@testing-library/react';
import { getServerSession } from 'next-auth/next';
import SaveDetailPage, { getServerSideProps } from '../../pages/saves/[id]';
import { prisma } from '../../lib/prisma';
import type { Team, TeamPlayer } from '../../context/GameContext';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/saves/g1', query: {}, asPath: '/saves/g1', push: jest.fn() }),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn().mockReturnValue({ data: null, status: 'unauthenticated' }),
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('../../lib/authOptions', () => ({ authOptions: {} }));
jest.mock('../../lib/prisma', () => ({
  prisma: { gameSave: { findUnique: jest.fn() } },
}));

function makePlayer(overrides: Partial<TeamPlayer> = {}): TeamPlayer {
  return {
    index: 0,
    name: 'Player',
    runs: 0,
    wicketsTaken: 0,
    currentStriker: false,
    allActions: [],
    currentNonStriker: false,
    currentBowler: false,
    onTheCrease: false,
    status: 'Not out',
    methodOfWicket: null,
    oversBowled: 0,
    runsConceded: 0,
    ...overrides,
  };
}

function makeTeam(overrides: Partial<Team> = {}): Team {
  return {
    players: [makePlayer({ name: 'Alice', runs: 20, allActions: ['4', '1'] })],
    name: 'Team A',
    index: 0,
    totalRuns: 20,
    totalWicketsConceded: 0,
    totalWicketsTaken: 0,
    overs: 2.0,
    currentBattingTeam: true,
    currentBowlingTeam: false,
    finishedBatting: true,
    ...overrides,
  };
}

const baseSave = {
  id: 'g1',
  title: 'Team A vs Team B',
  createdAt: '2026-06-05T00:00:00.000Z',
  completed: true,
  gameScore: [
    makeTeam({ name: 'Team A' }),
    makeTeam({ name: 'Team B', index: 1, players: [], totalRuns: 0, finishedBatting: false }),
  ] as [Team, Team],
};

describe('SaveDetailPage', () => {
  it('renders the save title and back link', () => {
    render(<SaveDetailPage save={baseSave} />);
    expect(screen.getByRole('heading', { name: 'Team A vs Team B' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to dashboard/i })).toHaveAttribute('href', '/dashboard');
  });

  it('shows a completed status badge', () => {
    render(<SaveDetailPage save={baseSave} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('shows an in progress status badge when not completed', () => {
    render(<SaveDetailPage save={{ ...baseSave, completed: false }} />);
    expect(screen.getByText('In progress')).toBeInTheDocument();
  });

  it('renders the 1st innings scorecard', () => {
    render(<SaveDetailPage save={baseSave} />);
    expect(screen.getByText('1st Innings')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('does not render a 2nd innings scorecard when the second team never batted', () => {
    render(<SaveDetailPage save={baseSave} />);
    expect(screen.queryByText('2nd Innings')).not.toBeInTheDocument();
  });

  it('renders the 2nd innings scorecard once the second team has batted', () => {
    const save = {
      ...baseSave,
      gameScore: [
        baseSave.gameScore[0],
        makeTeam({ name: 'Team B', index: 1, players: [makePlayer({ name: 'Bob', allActions: ['1'] })] }),
      ] as [Team, Team],
    };
    render(<SaveDetailPage save={save} />);
    expect(screen.getByText('2nd Innings')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows a fallback message when the save has no usable game data', () => {
    render(<SaveDetailPage save={{ ...baseSave, gameScore: null }} />);
    expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument();
  });

  it('falls back to "Untitled game" when there is no title', () => {
    render(<SaveDetailPage save={{ ...baseSave, title: null }} />);
    expect(screen.getByRole('heading', { name: 'Untitled game' })).toBeInTheDocument();
  });
});

describe('getServerSideProps', () => {
  const context = { req: {}, res: {}, params: { id: 'g1' } } as unknown as Parameters<typeof getServerSideProps>[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to sign-in when there is no session', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const result = await getServerSideProps(context);
    expect(result).toEqual({ redirect: { destination: '/auth/signin', permanent: false } });
  });

  it('returns notFound when the id param is missing', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    const result = await getServerSideProps({ ...context, params: {} } as unknown as Parameters<typeof getServerSideProps>[0]);
    expect(result).toEqual({ notFound: true });
  });

  it('returns notFound when the save does not exist', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (prisma.gameSave.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await getServerSideProps(context);
    expect(result).toEqual({ notFound: true });
  });

  it('returns notFound when the save belongs to a different user', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (prisma.gameSave.findUnique as jest.Mock).mockResolvedValue({
      id: 'g1',
      userId: 'someone-else',
      title: null,
      createdAt: new Date('2026-06-05T00:00:00.000Z'),
      completed: false,
      gameData: [],
    });
    const result = await getServerSideProps(context);
    expect(result).toEqual({ notFound: true });
  });

  it('returns the save with parsed game data when owned by the session user', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    const gameData = [makeTeam(), makeTeam({ name: 'Team B', index: 1 })];
    (prisma.gameSave.findUnique as jest.Mock).mockResolvedValue({
      id: 'g1',
      userId: 'u1',
      title: 'Team A vs Team B',
      createdAt: new Date('2026-06-05T00:00:00.000Z'),
      completed: true,
      gameData,
    });

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      props: {
        save: {
          id: 'g1',
          title: 'Team A vs Team B',
          createdAt: '2026-06-05T00:00:00.000Z',
          completed: true,
          gameScore: gameData,
        },
      },
    });
  });

  it('returns gameScore: null when the stored game data is not a valid two-team array', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (prisma.gameSave.findUnique as jest.Mock).mockResolvedValue({
      id: 'g1',
      userId: 'u1',
      title: null,
      createdAt: new Date('2026-06-05T00:00:00.000Z'),
      completed: false,
      gameData: { corrupted: true },
    });

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      props: {
        save: {
          id: 'g1',
          title: null,
          createdAt: '2026-06-05T00:00:00.000Z',
          completed: false,
          gameScore: null,
        },
      },
    });
  });
});
