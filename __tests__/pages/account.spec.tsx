import { render, screen } from '@testing-library/react';
import AccountPage from '../../pages/account';

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
jest.mock('../../lib/prisma', () => ({ prisma: {} }));

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
});
