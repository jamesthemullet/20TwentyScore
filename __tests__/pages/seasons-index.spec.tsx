import { render, screen } from '@testing-library/react';
import SeasonsPage from '../../pages/seasons/index';

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
jest.mock('../../lib/prisma', () => ({ prisma: {} }));

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
});
