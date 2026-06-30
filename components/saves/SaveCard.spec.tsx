import { fireEvent, render, screen } from '@testing-library/react';
import SaveCard from './SaveCard';

const baseProps = {
  id: 'abc123',
  title: 'England vs Australia',
  createdAt: new Date('2026-01-15T12:00:00.000Z'),
  completed: false,
};

describe('SaveCard', () => {
  it('renders the game title and correct status badge', () => {
    render(<SaveCard {...baseProps} />);
    expect(screen.getByText('England vs Australia')).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
  });

  it('shows "Completed" badge and "Untitled game" when title is null and game is complete', () => {
    render(<SaveCard {...baseProps} title={null} completed={true} />);
    expect(screen.getByText('Untitled game')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders a season selector and calls onSeasonChange when the selection changes', () => {
    const onSeasonChange = jest.fn();
    const seasons = [
      { id: 's1', name: 'Season 2025' },
      { id: 's2', name: 'Season 2026' },
    ];
    render(
      <SaveCard
        {...baseProps}
        seasons={seasons}
        seasonId="s1"
        onSeasonChange={onSeasonChange}
      />
    );
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('s1');
    fireEvent.change(select, { target: { value: 's2' } });
    expect(onSeasonChange).toHaveBeenCalledWith('abc123', 's2');
  });
});
