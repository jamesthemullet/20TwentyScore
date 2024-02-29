import React from 'react';
import { GameScoreProvider } from '../../context/GameScoreContext';
import { matchers } from '@emotion/jest';
import { render, screen } from '@testing-library/react';
import Scoreboard from './scoreboard';
import { MostRecentActionContext } from '../../context/MostRecentActionContext';

expect.extend(matchers);

const mostRecentAction = { runs: 4, action: null };
const setMostRecentAction = jest.fn();

describe('Scoreboard Component', () => {
  it('should render Scoreboard component on initial load', () => {
    render(
      <GameScoreProvider>
        <Scoreboard />
      </GameScoreProvider>
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Scoreboard');
    expect(screen.queryByText('Team 1')).toBeVisible();
    expect(screen.queryByText('Team 2')).toBeVisible();
    const runs = screen.getAllByText('Runs - Wickets (Overs)');
    expect(runs).toHaveLength(2);
    expect(screen.queryByText('Most recent ball:')).not.toBeInTheDocument();
  });

  it('should display most recent ball action', () => {
    render(
      <MostRecentActionContext.Provider value={{ mostRecentAction, setMostRecentAction }}>
        <Scoreboard />
      </MostRecentActionContext.Provider>
    );
    expect(screen.queryByText('Most recent ball: 4 runs')).toBeVisible();
  });
});
