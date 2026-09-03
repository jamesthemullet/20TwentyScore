import { render, screen } from '@testing-library/react';
import SeasonDetailPage from '../../pages/seasons/[id]';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/seasons/s1', query: {}, asPath: '/seasons/s1', push: jest.fn() }),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn().mockReturnValue({ data: null, status: 'unauthenticated' }),
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('../../lib/authOptions', () => ({ authOptions: {} }));
jest.mock('../../lib/subscription', () => ({ getUserTier: jest.fn() }));
jest.mock('../../lib/prisma', () => ({ prisma: {} }));

jest.mock('../../components/saves/SaveCard', () => ({
  __esModule: true,
  default: ({ title }: { title: string | null }) => <div data-testid="save-card">{title}</div>,
}));

const baseSeason = {
  id: 's1',
  name: 'Summer 2026',
  description: null as string | null,
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-08-31T00:00:00.000Z',
  gameSaves: [] as {
    id: string;
    title: string | null;
    createdAt: string;
    completed: boolean;
    seasonId: string | null;
  }[],
};

describe('SeasonDetailPage', () => {
  it('renders the season name and a link back to seasons', () => {
    render(<SeasonDetailPage season={baseSeason} />);
    expect(screen.getByRole('heading', { name: 'Summer 2026' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to seasons/i })).toHaveAttribute(
      'href',
      '/seasons',
    );
  });

  it('renders the season description when present', () => {
    render(<SeasonDetailPage season={{ ...baseSeason, description: 'Club league matches' }} />);
    expect(screen.getByText('Club league matches')).toBeInTheDocument();
  });

  it('shows the empty state when the season has no game saves', () => {
    render(<SeasonDetailPage season={baseSeason} />);
    expect(screen.getByText(/no games in this season yet/i)).toBeInTheDocument();
  });

  it('renders a SaveCard for each game save in the season', () => {
    render(
      <SeasonDetailPage
        season={{
          ...baseSeason,
          gameSaves: [
            { id: 'g1', title: 'Match 1', createdAt: '2026-06-05T00:00:00.000Z', completed: true, seasonId: 's1' },
            { id: 'g2', title: 'Match 2', createdAt: '2026-06-12T00:00:00.000Z', completed: false, seasonId: 's1' },
          ],
        }}
      />,
    );
    const cards = screen.getAllByTestId('save-card');
    expect(cards).toHaveLength(2);
    expect(screen.getByText('Match 1')).toBeInTheDocument();
    expect(screen.getByText('Match 2')).toBeInTheDocument();
  });
});
