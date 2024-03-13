import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Scoring from './scoring';
import { GameScore, GameScoreContext, useGameScore } from '../../context/GameScoreContext';

const gameScore = [
  {
    players: [
      {
        name: 'Player 1',
        index: 0,
        runs: 0,
        currentStriker: true,
        allActions: [],
        currentNonStriker: false
      },
      {
        name: 'Player 2',
        index: 1,
        runs: 0,
        currentStriker: false,
        allActions: [],
        currentNonStriker: true
      }
    ],
    name: 'Team 1',
    index: 0
  },
  { players: [], name: 'Team 2', index: 1 }
] as GameScore;
const setGameScore = jest.fn();
const setPlayerScore = jest.fn();

const ScoringProps = {
  onOverUpdate: jest.fn(),
  currentStriker: gameScore[0].players[0]
};

describe('Scoring Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should render a Scoring component successfully', () => {
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setPlayerScore
        }}>
        <Scoring {...ScoringProps} />
      </GameScoreContext.Provider>
    );
    const headingElement = screen.getByRole('heading', { level: 2 });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveTextContent('Scoring');

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(9);
  });

  it('should call setPlayerScore and onOverUpdate when the 0 runs button is clicked', () => {
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setPlayerScore
        }}>
        <Scoring {...ScoringProps} />
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: '0' });

    act(() => {
      fireEvent.click(button);
    });
    expect(setPlayerScore).toHaveBeenCalledTimes(1);
    expect(ScoringProps.onOverUpdate).toHaveBeenCalledTimes(1);
  });

  it('should set next ball action to disabled by default', () => {
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setPlayerScore
        }}>
        <Scoring {...ScoringProps} />
      </GameScoreContext.Provider>
    );
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      if (button.textContent === 'Next Ball') {
        expect(button).toBeDisabled();
      }
    });
  });

  it('should not call setPlayerScore if the 1+ button is clicked', () => {
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setPlayerScore
        }}>
        <Scoring {...ScoringProps} />
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: /1\+/i });
    act(() => {
      fireEvent.click(button);
    });
    expect(setPlayerScore).not.toHaveBeenCalled();
  });

  it('should enable next ball button when 1+ button is clicked', () => {
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setPlayerScore
        }}>
        <Scoring {...ScoringProps} />
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: /1\+/i });

    act(() => {
      fireEvent.click(button);
    });

    const nextBallButton = screen.getByRole('button', { name: 'Next Ball' });
    expect(nextBallButton).not.toBeDisabled();
  });

  it('should call setPlayerScore when next ball is clicked, and send the runs stored in state', () => {
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setPlayerScore
        }}>
        <Scoring {...ScoringProps} />
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: /1\+/i });

    act(() => {
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
    });

    const nextBallButton = screen.getByRole('button', { name: 'Next Ball' });

    act(() => {
      fireEvent.click(nextBallButton);
    });

    expect(setPlayerScore).toHaveBeenCalledWith(1, 0, 3, 'Next Ball');
  });
});
