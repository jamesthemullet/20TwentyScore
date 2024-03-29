import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Scoring from './scoring';
import { GameScore, GameScoreContext, useGameScore } from '../../context/GameScoreContext';
import { OversContext } from '../../context/OversContext';

const gameScore = [
  {
    players: [
      {
        name: 'Player 1',
        index: 0,
        runs: 0,
        currentStriker: true,
        allActions: [],
        onTheCrease: true,
        currentNonStriker: false,
        status: 'Not out'
      },
      {
        name: 'Player 2',
        index: 1,
        runs: 0,
        currentStriker: false,
        allActions: [],
        onTheCrease: true,
        currentNonStriker: true,
        status: 'Not out'
      }
    ],
    name: 'Team 1',
    index: 0
  },
  { players: [], name: 'Team 2', index: 1 }
] as GameScore;
const setGameScore = jest.fn();
const setPlayerScore = jest.fn();
const setCurrentBallInThisOver = jest.fn();
const setCurrentExtrasInThisOver = jest.fn();
const incrementCurrentOver = jest.fn();

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
        <Scoring />
      </GameScoreContext.Provider>
    );
    const headingElement = screen.getByRole('heading', { level: 2 });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveTextContent('Scoring');

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(9);
  });

  it('should call setPlayerScore when the 0 runs button is clicked', () => {
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setPlayerScore
        }}>
        <Scoring />
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: '0' });

    act(() => {
      fireEvent.click(button);
    });
    expect(setPlayerScore).toHaveBeenCalledTimes(1);
  });

  it('should set next ball action to disabled by default', () => {
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setPlayerScore
        }}>
        <Scoring />
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
        <Scoring />
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
        <Scoring />
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
        <Scoring />
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

  it('should add 1 to the current ball in over, when balls in over is less than 6, not including extras', () => {
    const currentOver = 1;
    const currentBallInThisOver = 1;
    const currentExtrasInThisOver = 0;
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setPlayerScore
        }}>
        <OversContext.Provider
          value={{
            currentOver,
            incrementCurrentOver,
            currentBallInThisOver,
            setCurrentBallInThisOver,
            currentExtrasInThisOver,
            setCurrentExtrasInThisOver
          }}>
          <Scoring />
        </OversContext.Provider>
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: /4/i });

    act(() => {
      fireEvent.click(button);
    });

    expect(setCurrentBallInThisOver).toHaveBeenCalled();
  });

  it('should increase the over count by 1 after the 6th ball, if are there no extras, set current ball to 1, and reset current extras to 0', () => {
    const currentOver = 1;
    const currentBallInThisOver = 6;
    const currentExtrasInThisOver = 0;
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setPlayerScore
        }}>
        <OversContext.Provider
          value={{
            currentOver,
            incrementCurrentOver,
            currentBallInThisOver,
            setCurrentBallInThisOver,
            currentExtrasInThisOver,
            setCurrentExtrasInThisOver
          }}>
          <Scoring />
        </OversContext.Provider>
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: /4/i });

    act(() => {
      fireEvent.click(button);
    });

    expect(incrementCurrentOver).toHaveBeenCalled();
    expect(setCurrentBallInThisOver).toHaveBeenCalledWith(1);
    expect(setCurrentExtrasInThisOver).toHaveBeenCalledWith('reset');
  });

  it('should not increase the over count by 1 after the 6th ball, if there are extras', () => {
    const currentOver = 1;
    const currentBallInThisOver = 6;
    const currentExtrasInThisOver = 1;
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setPlayerScore
        }}>
        <OversContext.Provider
          value={{
            currentOver,
            incrementCurrentOver,
            currentBallInThisOver,
            setCurrentBallInThisOver,
            currentExtrasInThisOver,
            setCurrentExtrasInThisOver
          }}>
          <Scoring />
        </OversContext.Provider>
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: /4/i });

    act(() => {
      fireEvent.click(button);
    });

    expect(incrementCurrentOver).not.toHaveBeenCalled();
  });

  it('should increase extras if wide or no ball is clicked', () => {
    const currentOver = 1;
    const currentBallInThisOver = 1;
    const currentExtrasInThisOver = 0;
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setPlayerScore
        }}>
        <OversContext.Provider
          value={{
            currentOver,
            incrementCurrentOver,
            currentBallInThisOver,
            setCurrentBallInThisOver,
            currentExtrasInThisOver,
            setCurrentExtrasInThisOver
          }}>
          <Scoring />
        </OversContext.Provider>
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: /wide/i });

    act(() => {
      fireEvent.click(button);
    });

    expect(setCurrentExtrasInThisOver).toHaveBeenCalledWith(1);
  });
});
