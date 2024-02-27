import React from 'react';
import {
  GameScore,
  GameScoreContext,
  GameScoreProvider,
  useGameScore
} from '../../context/GameScoreContext';
import { matchers } from '@emotion/jest';
import { render, screen } from '@testing-library/react';
import Scoreboard from './scoreboard';

expect.extend(matchers);

const setGameScore = jest.fn();
const gameScore = [
  { team1Players: [], name: 'Team 1', index: 0 },
  { team2Players: [], name: 'Team 2', index: 1 }
] as GameScore;
const setPlayerScore = jest.fn();
const setMostRecentAction = jest.fn();
const mostRecentAction = { runs: 4, action: null };

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
      <GameScoreContext.Provider
        value={{ setGameScore, gameScore, setPlayerScore, mostRecentAction, setMostRecentAction }}>
        <Scoreboard />
      </GameScoreContext.Provider>
    );
    expect(screen.queryByText('Most recent ball: 4 runs')).toBeVisible();
  });
});
