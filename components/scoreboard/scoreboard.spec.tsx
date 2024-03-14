import React from 'react';
import { GameScoreProvider } from '../../context/GameScoreContext';
import { matchers } from '@emotion/jest';
import { render, screen } from '@testing-library/react';
import Scoreboard from './scoreboard';
import { MostRecentActionContext } from '../../context/MostRecentActionContext';
import { OversContext } from '../../context/OversContext';

expect.extend(matchers);

const setMostRecentAction = jest.fn();
const incrementCurrentOver = jest.fn();
const setCurrentBallInThisOver = jest.fn();
const setCurrentExtrasInThisOver = jest.fn();

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

  it('should display most recent ball action including plural when anything other than 1 run', () => {
    const mostRecentAction = { runs: 4, action: null };
    render(
      <MostRecentActionContext.Provider value={{ mostRecentAction, setMostRecentAction }}>
        <Scoreboard />
      </MostRecentActionContext.Provider>
    );
    expect(screen.queryByText('Most recent ball: 4 runs')).toBeVisible();
  });

  it('should display most recent ball action including singular when 1 run', () => {
    const mostRecentAction = { runs: 1, action: null };
    render(
      <MostRecentActionContext.Provider value={{ mostRecentAction, setMostRecentAction }}>
        <Scoreboard />
      </MostRecentActionContext.Provider>
    );
    expect(screen.queryByText('Most recent ball: 1 run')).toBeVisible();
  });

  it('should display most recent ball action when action is a wicket', () => {
    const mostRecentAction = { runs: 0, action: 'Wicket' };
    render(
      <MostRecentActionContext.Provider value={{ mostRecentAction, setMostRecentAction }}>
        <Scoreboard />
      </MostRecentActionContext.Provider>
    );
    expect(screen.queryByText('Most recent ball: Wicket')).toBeVisible();
  });

  it('should display most recent ball action when action is a wide', () => {
    const mostRecentAction = { runs: 1, action: 'Wide' };
    render(
      <MostRecentActionContext.Provider value={{ mostRecentAction, setMostRecentAction }}>
        <Scoreboard />
      </MostRecentActionContext.Provider>
    );
    expect(screen.queryByText('Most recent ball: Wide')).toBeVisible();
  });

  it('should display most recent ball action when action is a no ball', () => {
    const mostRecentAction = { runs: 1, action: 'No Ball' };
    render(
      <MostRecentActionContext.Provider value={{ mostRecentAction, setMostRecentAction }}>
        <Scoreboard />
      </MostRecentActionContext.Provider>
    );
    expect(screen.queryByText('Most recent ball: No Ball')).toBeVisible();
  });

  it('should display most recent ball action when action is next ball', () => {
    const mostRecentAction = { runs: 2, action: 'Next Ball' };
    render(
      <MostRecentActionContext.Provider value={{ mostRecentAction, setMostRecentAction }}>
        <Scoreboard />
      </MostRecentActionContext.Provider>
    );
    expect(screen.queryByText('Most recent ball: 2 runs')).toBeVisible();
  });

  it('should display current ball, current over and current extras in over', () => {
    const currentOver = 1;
    const currentBallInThisOver = 1;
    const currentExtrasInThisOver = 0;
    render(
      <OversContext.Provider
        value={{
          currentOver,
          incrementCurrentOver,
          currentBallInThisOver,
          setCurrentBallInThisOver,
          currentExtrasInThisOver,
          setCurrentExtrasInThisOver
        }}>
        <Scoreboard />
      </OversContext.Provider>
    );
    expect(screen.getByText('Over: 1 Ball: 1 (extras: 0)')).toBeVisible();
  });
});
