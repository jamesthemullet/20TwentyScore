import { render, screen } from '@testing-library/react';
import ScoreboardPage from './scoreboard';

jest.mock('next/router', () => ({
  useRouter: () => ({ asPath: '/' }),
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
