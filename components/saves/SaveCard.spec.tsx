import { fireEvent, render, screen } from '@testing-library/react';
import SaveCard from './SaveCard';

const baseProps = {
  id: 'save-1',
  title: 'England vs Australia — 15 Jan',
  createdAt: new Date('2026-01-15T12:00:00.000Z'),
  completed: false,
};

describe('SaveCard', () => {
  it('renders the save title, formatted date, and status badge', () => {
    render(<SaveCard {...baseProps} />);
    expect(screen.getByText('England vs Australia — 15 Jan')).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
    // Date rendered via toLocaleDateString en-GB with year
    expect(screen.getByText(/Jan 2026/)).toBeInTheDocument();
  });

  it('shows the season dropdown with all options when seasons and onSeasonChange are provided', () => {
    const onSeasonChange = jest.fn();
    const seasons = [
      { id: 'season-1', name: 'Summer 2026' },
      { id: 'season-2', name: 'Winter 2025' },
    ];
    render(<SaveCard {...baseProps} seasons={seasons} onSeasonChange={onSeasonChange} />);

    const select = screen.getByLabelText('Assign to season');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('No season')).toBeInTheDocument();
    expect(screen.getByText('Summer 2026')).toBeInTheDocument();
    expect(screen.getByText('Winter 2025')).toBeInTheDocument();
  });

  it('calls onSeasonChange with the save id and selected season id when a season is chosen', () => {
    const onSeasonChange = jest.fn();
    const seasons = [{ id: 'season-1', name: 'Summer 2026' }];
    render(<SaveCard {...baseProps} seasons={seasons} onSeasonChange={onSeasonChange} />);

    fireEvent.change(screen.getByLabelText('Assign to season'), { target: { value: 'season-1' } });
    expect(onSeasonChange).toHaveBeenCalledWith('save-1', 'season-1');
  });

  it('calls onSeasonChange with null when "No season" is chosen', () => {
    const onSeasonChange = jest.fn();
    const seasons = [{ id: 'season-1', name: 'Summer 2026' }];
    render(<SaveCard {...baseProps} seasonId="season-1" seasons={seasons} onSeasonChange={onSeasonChange} />);

    fireEvent.change(screen.getByLabelText('Assign to season'), { target: { value: '' } });
    expect(onSeasonChange).toHaveBeenCalledWith('save-1', null);
  });

  it('stops the season row click from bubbling to the card link', () => {
    const onSeasonChange = jest.fn();
    const seasons = [{ id: 'season-1', name: 'Summer 2026' }];
    render(<SaveCard {...baseProps} seasons={seasons} onSeasonChange={onSeasonChange} />);

    const stopPropagation = jest.spyOn(Event.prototype, 'stopPropagation');
    fireEvent.click(screen.getByLabelText('Assign to season').parentElement as HTMLElement);
    expect(stopPropagation).toHaveBeenCalled();
    stopPropagation.mockRestore();
  });

  it('renders the completed status badge when completed is true', () => {
    render(<SaveCard {...baseProps} completed />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('falls back to "Untitled game" when title is null', () => {
    render(<SaveCard {...baseProps} title={null} />);
    expect(screen.getByText('Untitled game')).toBeInTheDocument();
  });
});
