import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Scoring from './scoring';
import { GameScore, GameScoreContext } from '../../context/GameScoreContext';
import { OversContext } from '../../context/OversContext';

const gameScore = [
  {
    players: [
      {
        name: 'Player 1',
        index: 0,
        runs: 0,
        wicketsTaken: 0,
        currentStriker: true,
        currentBowler: false,
        allActions: [],
        onTheCrease: true,
        currentNonStriker: false,
        status: 'Not out'
      },
      {
        name: 'Player 2',
        index: 1,
        runs: 0,
        wicketsTaken: 0,
        currentStriker: false,
        currentBowler: false,
        allActions: [],
        onTheCrease: true,
        currentNonStriker: true,
        status: 'Not out'
      }
    ],
    name: 'Team 1',
    index: 0,
    totalRuns: 0,
    totalWicketsConceded: 0,
    totalWicketsTaken: 0,
    overs: 0,
    currentBattingTeam: true,
    currentBowlingTeam: false,
    finishedBatting: false
  },
  {
    players: [
      {
        name: 'Player 1',
        index: 0,
        runs: 0,
        wicketsTaken: 0,
        currentStriker: true,
        currentBowler: true,
        allActions: [],
        onTheCrease: true,
        currentNonStriker: false,
        status: 'Not out'
      }
    ],
    name: 'Team 2',
    index: 1,
    totalRuns: 0,
    totalWicketsConceded: 0,
    totalWicketsTaken: 0,
    overs: 0,
    currentBattingTeam: false,
    currentBowlingTeam: true,
    finishedBatting: false
  }
] as GameScore;
const setGameScore = jest.fn();
const setBattingPlayerScore = jest.fn();
const setBowlingPlayerScore = jest.fn();
const setCurrentBallInThisOver = jest.fn();
const setCurrentExtrasInThisOver = jest.fn();
const setCurrentOvers = jest.fn();
const swapBatsmen = jest.fn();
const resetOvers = jest.fn();

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
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
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

  it('should call setBattingPlayerScore when the 0 runs button is clicked', () => {
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
        }}>
        <Scoring />
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: '0' });

    act(() => {
      fireEvent.click(button);
    });
    expect(setBattingPlayerScore).toHaveBeenCalledTimes(1);
  });

  it('should call setBattingPlayerScore when the 1 run button is clicked', () => {
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
        }}>
        <Scoring />
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: '1 & next ball' });

    act(() => {
      fireEvent.click(button);
    });
    expect(setBattingPlayerScore).toHaveBeenCalledTimes(1);
    expect(setBattingPlayerScore).toHaveBeenCalledWith(0, 0, 1, null, false, false);
  });

  it('should call setBattingPlayerScore when the 6 runs button is clicked', () => {
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
        }}>
        <Scoring />
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: '6' });

    act(() => {
      fireEvent.click(button);
    });
    expect(setBattingPlayerScore).toHaveBeenCalledTimes(1);
    expect(setBattingPlayerScore).toHaveBeenCalledWith(0, 0, 6, null, false, false);
  });

  it('should call setBattingPlayerScore when the wicket button is clicked', () => {
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
        }}>
        <Scoring />
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: 'Wicket' });

    act(() => {
      fireEvent.click(button);
    });
    expect(setBattingPlayerScore).toHaveBeenCalledTimes(1);
    expect(setBattingPlayerScore).toHaveBeenCalledWith(0, 0, 0, 'Wicket', false, false);
  });

  it('should set next ball action to disabled by default', () => {
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
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

  it('should not call setBattingPlayerScore if the 1+ button is clicked', () => {
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
        }}>
        <Scoring />
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: /1\+/i });
    act(() => {
      fireEvent.click(button);
    });
    expect(setBattingPlayerScore).not.toHaveBeenCalled();
  });

  it('should enable next ball button when 1+ button is clicked', () => {
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
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

  it('should call setBattingPlayerScore when next ball is clicked, and send the runs stored in state', () => {
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
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

    expect(setBattingPlayerScore).toHaveBeenCalledWith(0, 0, 3, 'Next Ball', false, false);
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
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
        }}>
        <OversContext.Provider
          value={{
            currentOver,
            setCurrentOvers,
            resetOvers,
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
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
        }}>
        <OversContext.Provider
          value={{
            currentOver,
            setCurrentOvers,
            resetOvers,
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

    expect(setCurrentOvers).toHaveBeenCalled();
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
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
        }}>
        <OversContext.Provider
          value={{
            currentOver,
            setCurrentOvers,
            resetOvers,
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

    expect(setCurrentOvers).not.toHaveBeenCalled();
  });

  it('should increase extras if wide is clicked', () => {
    const currentOver = 1;
    const currentBallInThisOver = 1;
    const currentExtrasInThisOver = 0;
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
        }}>
        <OversContext.Provider
          value={{
            currentOver,
            setCurrentOvers,
            resetOvers,
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
    expect(setBattingPlayerScore).toHaveBeenCalledWith(0, 0, 1, 'Wide', false, false);
  });

  it('should increase extras if no ball is clicked', () => {
    const currentOver = 1;
    const currentBallInThisOver = 1;
    const currentExtrasInThisOver = 0;
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
        }}>
        <OversContext.Provider
          value={{
            currentOver,
            setCurrentOvers,
            resetOvers,
            currentBallInThisOver,
            setCurrentBallInThisOver,
            currentExtrasInThisOver,
            setCurrentExtrasInThisOver
          }}>
          <Scoring />
        </OversContext.Provider>
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: /no ball/i });

    act(() => {
      fireEvent.click(button);
    });

    expect(setCurrentExtrasInThisOver).toHaveBeenCalledWith(1);
    expect(setBattingPlayerScore).toHaveBeenCalledWith(0, 0, 1, 'No Ball', false, false);
  });

  it('should not call setBattingPlayerScore if playerIndex is undefined', () => {
    const currentOver = 1;
    const currentBallInThisOver = 1;
    const currentExtrasInThisOver = 0;
    const gameScore = [
      {
        players: [
          {
            name: 'Player 1',
            index: undefined,
            runs: 0,
            wicketsTaken: 0,
            currentStriker: true,
            currentBowler: false,
            allActions: [],
            onTheCrease: true,
            currentNonStriker: false,
            status: 'Not out'
          },
          {
            name: 'Player 2',
            index: 1,
            runs: 0,
            wicketsTaken: 0,
            currentStriker: false,
            currentBowler: false,
            allActions: [],
            onTheCrease: true,
            currentNonStriker: true,
            status: 'Not out'
          }
        ],
        name: 'Team 1',
        index: 0,
        totalRuns: 0,
        totalWicketsConceded: 0,
        totalWicketsTaken: 0,
        overs: 0,
        currentBattingTeam: true,
        currentBowlingTeam: false,
        finishedBatting: false
      },
      {
        players: [
          {
            name: 'Player 1',
            index: 0,
            runs: 0,
            wicketsTaken: 0,
            currentStriker: true,
            currentBowler: true,
            allActions: [],
            onTheCrease: true,
            currentNonStriker: false,
            status: 'Not out'
          }
        ],
        name: 'Team 2',
        index: 1,
        totalRuns: 0,
        totalWicketsConceded: 0,
        totalWicketsTaken: 0,
        overs: 0,
        currentBattingTeam: false,
        currentBowlingTeam: true,
        finishedBatting: false
      }
    ] as GameScore;
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
        }}>
        <OversContext.Provider
          value={{
            currentOver,
            setCurrentOvers,
            resetOvers,
            currentBallInThisOver,
            setCurrentBallInThisOver,
            currentExtrasInThisOver,
            setCurrentExtrasInThisOver
          }}>
          <Scoring />
        </OversContext.Provider>
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: /no ball/i });

    act(() => {
      fireEvent.click(button);
    });

    expect(setBattingPlayerScore).not.toHaveBeenCalled();
  });

  it('should call endOfInnings on the 10th wicket', () => {
    const currentOver = 1;
    const currentBallInThisOver = 1;
    const currentExtrasInThisOver = 0;
    const gameScore = [
      {
        players: [
          {
            name: 'Player 1',
            index: 0,
            runs: 0,
            wicketsTaken: 0,
            currentStriker: true,
            currentBowler: false,
            allActions: [],
            onTheCrease: true,
            currentNonStriker: false,
            status: 'Not out'
          },
          {
            name: 'Player 2',
            index: 1,
            runs: 0,
            wicketsTaken: 0,
            currentStriker: false,
            currentBowler: false,
            allActions: [],
            onTheCrease: true,
            currentNonStriker: true,
            status: 'Not out'
          }
        ],
        name: 'Team 1',
        index: 0,
        totalRuns: 0,
        totalWicketsConceded: 9,
        totalWicketsTaken: 0,
        overs: 0,
        currentBattingTeam: true,
        currentBowlingTeam: false,
        finishedBatting: false
      },
      {
        players: [
          {
            name: 'Player 1',
            index: 0,
            runs: 0,
            wicketsTaken: 0,
            currentStriker: true,
            currentBowler: true,
            allActions: [],
            onTheCrease: true,
            currentNonStriker: false,
            status: 'Not out'
          }
        ],
        name: 'Team 2',
        index: 1,
        totalRuns: 0,
        totalWicketsConceded: 0,
        totalWicketsTaken: 0,
        overs: 0,
        currentBattingTeam: false,
        currentBowlingTeam: true,
        finishedBatting: false
      }
    ] as GameScore;
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
        }}>
        <OversContext.Provider
          value={{
            currentOver,
            setCurrentOvers,
            resetOvers,
            currentBallInThisOver,
            setCurrentBallInThisOver,
            currentExtrasInThisOver,
            setCurrentExtrasInThisOver
          }}>
          <Scoring />
        </OversContext.Provider>
      </GameScoreContext.Provider>
    );
    const button = screen.getByRole('button', { name: /Wicket/i });

    act(() => {
      fireEvent.click(button);
    });

    expect(setBattingPlayerScore).toHaveBeenCalledWith(0, 0, 0, 'Wicket', false, true);
  });

  it('should call end of innings on the last ball of the 20th over', () => {
    const currentOver = 19;
    const currentBallInThisOver = 6;
    const currentExtrasInThisOver = 0;
    const gameScore = [
      {
        players: [
          {
            name: 'Player 1',
            index: 0,
            runs: 0,
            wicketsTaken: 0,
            currentStriker: true,
            currentBowler: false,
            allActions: [],
            onTheCrease: true,
            currentNonStriker: false,
            status: 'Not out'
          },
          {
            name: 'Player 2',
            index: 1,
            runs: 0,
            wicketsTaken: 0,
            currentStriker: false,
            currentBowler: false,
            allActions: [],
            onTheCrease: true,
            currentNonStriker: true,
            status: 'Not out'
          }
        ],
        name: 'Team 1',
        index: 0,
        totalRuns: 0,
        totalWicketsConceded: 9,
        totalWicketsTaken: 0,
        overs: 19,
        currentBattingTeam: true,
        currentBowlingTeam: false,
        finishedBatting: false
      },
      {
        players: [
          {
            name: 'Player 1',
            index: 0,
            runs: 0,
            wicketsTaken: 0,
            currentStriker: true,
            currentBowler: true,
            allActions: [],
            onTheCrease: true,
            currentNonStriker: false,
            status: 'Not out'
          }
        ],
        name: 'Team 2',
        index: 1,
        totalRuns: 0,
        totalWicketsConceded: 0,
        totalWicketsTaken: 0,
        overs: 0,
        currentBattingTeam: false,
        currentBowlingTeam: true,
        finishedBatting: false
      }
    ] as GameScore;
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
        }}>
        <OversContext.Provider
          value={{
            currentOver,
            setCurrentOvers,
            resetOvers,
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

    expect(setBattingPlayerScore).toHaveBeenCalledWith(0, 0, 4, null, true, true);
  });

  it('should set all buttons to disabled when the game is finished', () => {
    const currentOver = 19;
    const currentBallInThisOver = 6;
    const currentExtrasInThisOver = 0;
    const gameScore = [
      {
        players: [
          {
            name: 'Player 1',
            index: 0,
            runs: 0,
            wicketsTaken: 0,
            currentStriker: true,
            allActions: [],
            onTheCrease: true,
            currentNonStriker: false,
            currentBowler: false,
            status: 'Not out'
          },
          {
            name: 'Player 2',
            index: 1,
            runs: 0,
            wicketsTaken: 0,
            currentStriker: false,
            allActions: [],
            onTheCrease: true,
            currentNonStriker: true,
            currentBowler: false,
            status: 'Not out'
          }
        ],
        name: 'Team 1',
        index: 0,
        totalRuns: 0,
        totalWicketsConceded: 9,
        totalWicketsTaken: 0,
        overs: 19,
        currentBattingTeam: true,
        currentBowlingTeam: false,
        finishedBatting: true
      },
      {
        players: [],
        name: 'Team 2',
        index: 1,
        totalRuns: 0,
        totalWicketsConceded: 0,
        totalWicketsTaken: 0,
        overs: 0,
        currentBattingTeam: false,
        currentBowlingTeam: true,
        finishedBatting: true
      }
    ] as GameScore;
    render(
      <GameScoreContext.Provider
        value={{
          setGameScore,
          gameScore,
          setBattingPlayerScore,
          setBowlingPlayerScore,
          swapBatsmen
        }}>
        <OversContext.Provider
          value={{
            currentOver,
            setCurrentOvers,
            resetOvers,
            currentBallInThisOver,
            setCurrentBallInThisOver,
            currentExtrasInThisOver,
            setCurrentExtrasInThisOver
          }}>
          <Scoring />
        </OversContext.Provider>
      </GameScoreContext.Provider>
    );
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
