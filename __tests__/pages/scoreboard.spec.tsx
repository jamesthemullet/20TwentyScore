import { render, screen } from '@testing-library/react';
import ScoreboardPage from '../../pages/scoreboard';

jest.mock('next/router', () => ({
  useRouter: () => ({ asPath: '/' }),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' })
}));

describe('ScoreboardPage', () => {
  it('renders the coming soon message', () => {
    render(<ScoreboardPage />);
    expect(screen.getByText('Scoreboard coming soon.')).toBeInTheDocument();
  });

  it('renders a link back to the home page', () => {
    render(<ScoreboardPage />);
    const link = screen.getByRole('link', { name: /go home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });
});
