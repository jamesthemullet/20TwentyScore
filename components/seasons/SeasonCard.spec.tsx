import { render, screen } from '@testing-library/react';
import SeasonCard from './SeasonCard';

const baseProps = {
  id: 'season-1',
  name: 'Summer 2026',
  gameCount: 5,
  createdAt: new Date('2026-06-01T00:00:00.000Z'),
  updatedAt: new Date('2026-08-31T00:00:00.000Z'),
};

describe('SeasonCard', () => {
  it('renders the season name', () => {
    render(<SeasonCard {...baseProps} />);
    expect(screen.getByText('Summer 2026')).toBeInTheDocument();
  });

  it('links to the correct season page', () => {
    render(<SeasonCard {...baseProps} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/seasons/season-1');
  });

  it('displays plural "games" when gameCount is greater than one', () => {
    render(<SeasonCard {...baseProps} gameCount={5} />);
    expect(screen.getByText(/5 games/)).toBeInTheDocument();
  });

  it('displays singular "game" when gameCount is exactly one', () => {
    render(<SeasonCard {...baseProps} gameCount={1} />);
    expect(screen.getByText(/1 game/)).toBeInTheDocument();
    expect(screen.queryByText(/1 games/)).not.toBeInTheDocument();
  });

  it('renders the formatted date range', () => {
    render(<SeasonCard {...baseProps} />);
    // Both dates should be visible in some locale-formatted form
    expect(screen.getByText(/Jun 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Aug 2026/)).toBeInTheDocument();
  });
});
