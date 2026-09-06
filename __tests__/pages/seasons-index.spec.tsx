import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getServerSession } from 'next-auth/next';
import SeasonsPage, { getServerSideProps } from '../../pages/seasons/index';
import { getUserTier } from '../../lib/subscription';
import { prisma } from '../../lib/prisma';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/seasons', query: {}, asPath: '/seasons', push: jest.fn() }),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn().mockReturnValue({ data: null, status: 'unauthenticated' }),
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('../../lib/authOptions', () => ({ authOptions: {} }));
jest.mock('../../lib/subscription', () => ({ getUserTier: jest.fn() }));
jest.mock('../../lib/prisma', () => ({
  prisma: { season: { findMany: jest.fn() } },
}));

jest.mock('../../components/premium/UpgradeCTA', () => ({
  __esModule: true,
  default: () => <div data-testid="upgrade-cta" />,
}));

jest.mock('../../components/seasons/SeasonCard', () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => <div data-testid="season-card">{name}</div>,
}));

const baseSeasons = [
  {
    id: 's1',
    name: 'Summer 2026',
    description: null,
    gameCount: 3,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-08-31T00:00:00.000Z',
  },
  {
    id: 's2',
    name: 'Winter 2025',
    description: null,
    gameCount: 0,
    createdAt: '2025-11-01T00:00:00.000Z',
    updatedAt: '2026-02-28T00:00:00.000Z',
  },
];

describe('SeasonsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows UpgradeCTA for free tier users', () => {
    render(<SeasonsPage tier="free" seasons={[]} />);
    expect(screen.getByTestId('upgrade-cta')).toBeInTheDocument();
  });

  it('shows the empty state message when a premium user has no seasons', () => {
    render(<SeasonsPage tier="premium" seasons={[]} />);
    expect(screen.getByText(/no seasons yet/i)).toBeInTheDocument();
  });

  it('renders a season card for each season', () => {
    render(<SeasonsPage tier="premium" seasons={baseSeasons} />);
    const cards = screen.getAllByTestId('season-card');
    expect(cards).toHaveLength(2);
    expect(screen.getByText('Summer 2026')).toBeInTheDocument();
    expect(screen.getByText('Winter 2025')).toBeInTheDocument();
  });

  describe('createSeason', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('does nothing when the name is blank', () => {
      render(<SeasonsPage tier="premium" seasons={[]} />);
      fireEvent.click(screen.getByRole('button', { name: /new season/i }));
      fireEvent.submit(screen.getByLabelText('Season name').closest('form') as HTMLFormElement);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('adds the new season, clears the form, and closes it on success', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 's3',
          name: 'Autumn 2026',
          description: null,
          createdAt: '2026-09-01T00:00:00.000Z',
          updatedAt: '2026-09-01T00:00:00.000Z',
        }),
      });

      render(<SeasonsPage tier="premium" seasons={[]} />);
      fireEvent.click(screen.getByRole('button', { name: /new season/i }));
      fireEvent.change(screen.getByLabelText('Season name'), { target: { value: 'Autumn 2026' } });
      fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

      await waitFor(() => {
        expect(screen.getByText('Autumn 2026')).toBeInTheDocument();
      });
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/seasons',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Autumn 2026' }),
        }),
      );
      expect(screen.queryByLabelText('Season name')).not.toBeInTheDocument();
    });

    it('shows an error message when the request fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

      render(<SeasonsPage tier="premium" seasons={[]} />);
      fireEvent.click(screen.getByRole('button', { name: /new season/i }));
      fireEvent.change(screen.getByLabelText('Season name'), { target: { value: 'Autumn 2026' } });
      fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent(/could not create season/i);
    });

    it('shows a generic error message when the request throws', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('network down'));

      render(<SeasonsPage tier="premium" seasons={[]} />);
      fireEvent.click(screen.getByRole('button', { name: /new season/i }));
      fireEvent.change(screen.getByLabelText('Season name'), { target: { value: 'Autumn 2026' } });
      fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

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

  it('returns an empty seasons list for free tier users without querying the database', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (getUserTier as jest.Mock).mockResolvedValue('free');

    const result = await getServerSideProps(context);

    expect(result).toEqual({ props: { tier: 'free', seasons: [] } });
    expect(prisma.season.findMany).not.toHaveBeenCalled();
  });

  it('fetches and maps seasons for premium tier users', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (getUserTier as jest.Mock).mockResolvedValue('premium');
    const createdAt = new Date('2026-06-01T00:00:00.000Z');
    const updatedAt = new Date('2026-08-31T00:00:00.000Z');
    (prisma.season.findMany as jest.Mock).mockResolvedValue([
      {
        id: 's1',
        name: 'Summer 2026',
        description: null,
        createdAt,
        updatedAt,
        _count: { gameSaves: 3 },
      },
    ]);

    const result = await getServerSideProps(context);

    expect(prisma.season.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1' } }),
    );
    expect(result).toEqual({
      props: {
        tier: 'premium',
        seasons: [
          {
            id: 's1',
            name: 'Summer 2026',
            description: null,
            gameCount: 3,
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
          },
        ],
      },
    });
  });
});
