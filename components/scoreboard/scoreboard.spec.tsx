import React from 'react';
import { GameScoreProvider, useGameScore } from '../../context/GameScoreContext';
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

  it('should display total runs, total wickets and overs', () => {
    const MockChildComponent = () => {
      const { gameScore, setGameScore } = useGameScore();
      React.useEffect(() => {
        setGameScore([
          {
            players: [
              {
                name: 'Player 1',
                index: 0,
                runs: 10,
                currentStriker: true,
                allActions: [],
                onTheCrease: true,
                currentNonStriker: false,
                status: 'Not out'
              },
              {
                name: 'Player 2',
                index: 0,
                runs: 0,
                currentStriker: false,
                allActions: [],
                onTheCrease: true,
                currentNonStriker: true,
                status: 'Not out'
              },
              {
                name: 'Player 3',
                index: 0,
                runs: 10,
                currentStriker: false,
                allActions: [],
                onTheCrease: false,
                currentNonStriker: false,
                status: 'Not out'
              },
              {
                name: 'Player 4',
                index: 0,
                runs: 10,
                currentStriker: false,
                allActions: [],
                onTheCrease: false,
                currentNonStriker: false,
                status: 'Not out'
              }
            ],
            name: 'Team 1',
            index: 0,
            totalRuns: 30,
            totalWickets: 2,
            overs: 5,
            currentBattingTeam: true,
            finishedBatting: false
          },
          {
            players: [
              {
                name: 'Player 1',
                index: 0,
                runs: 0,
                currentStriker: false,
                allActions: [],
                onTheCrease: false,
                currentNonStriker: true,
                status: 'Not out'
              }
            ],
            name: 'Team 2',
            index: 1,
            totalRuns: 0,
            totalWickets: 0,
            overs: 0,
            currentBattingTeam: false,
            finishedBatting: false
          }
        ]);
      }, []);

      const team1 = gameScore[0];
      const team2 = gameScore[1];

      return (
        <>
          <div>
            <p>Team 1</p>
            <p>
              {team1.totalRuns} Runs - {team1.totalWickets} Wickets ({team1.overs} Overs)
            </p>
          </div>
          <div>
            <p>Team 2</p>
            <p>
              {team2.totalRuns} Runs - {team2.totalWickets} Wickets ({team2.overs} Overs)
            </p>
          </div>
        </>
      );
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );
    expect(screen.queryByText('Team 1')).toBeVisible();
    expect(screen.queryByText('Team 2')).toBeVisible();
    expect(screen.queryByText('30 Runs - 2 Wickets (5 Overs)')).toBeVisible();
    expect(screen.queryByText('0 Runs - 0 Wickets (0 Overs)')).toBeVisible();
  });

  it('should display game over message and winner when both teams have finished batting', () => {
    const MockChildComponent = () => {
      const { gameScore, setGameScore } = useGameScore();
      React.useEffect(() => {
        setGameScore([
          {
            players: [
              {
                name: 'Player 1',
                index: 0,
                runs: 10,
                currentStriker: true,
                allActions: [],
                onTheCrease: true,
                currentNonStriker: false,
                status: 'Not out'
              },
              {
                name: 'Player 2',
                index: 0,
                runs: 0,
                currentStriker: false,
                allActions: [],
                onTheCrease: true,
                currentNonStriker: true,
                status: 'Not out'
              },
              {
                name: 'Player 3',
                index: 0,
                runs: 10,
                currentStriker: false,
                allActions: [],
                onTheCrease: false,
                currentNonStriker: false,
                status: 'Not out'
              },
              {
                name: 'Player 4',
                index: 0,
                runs: 10,
                currentStriker: false,
                allActions: [],
                onTheCrease: false,
                currentNonStriker: false,
                status: 'Not out'
              }
            ],
            name: 'Team 1',
            index: 0,
            totalRuns: 30,
            totalWickets: 2,
            overs: 5,
            currentBattingTeam: true,
            finishedBatting: true
          },
          {
            players: [
              {
                name: 'Player 1',
                index: 0,
                runs: 0,
                currentStriker: false,
                allActions: [],
                onTheCrease: false,
                currentNonStriker: true,
                status: 'Not out'
              }
            ],
            name: 'Team 2',
            index: 1,
            totalRuns: 0,
            totalWickets: 0,
            overs: 0,
            currentBattingTeam: false,
            finishedBatting: true
          }
        ]);
      }, []);

      const team1 = gameScore[0];
      const team2 = gameScore[1];

      return (
        <>
          {gameScore[0].finishedBatting && gameScore[1].finishedBatting && (
            <p>Game Over! {team1.totalRuns > team2.totalRuns ? 'Team 1' : 'Team 2'} wins!</p>
          )}
        </>
      );
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );
    expect(screen.queryByText('Game Over! Team 1 wins!')).toBeVisible();
  });

  it('should not display game over message and winner when both teams have not finished batting', () => {
    const MockChildComponent = () => {
      const { gameScore, setGameScore } = useGameScore();
      React.useEffect(() => {
        setGameScore([
          {
            players: [
              {
                name: 'Player 1',
                index: 0,
                runs: 10,
                currentStriker: true,
                allActions: [],
                onTheCrease: true,
                currentNonStriker: false,
                status: 'Not out'
              },
              {
                name: 'Player 2',
                index: 0,
                runs: 0,
                currentStriker: false,
                allActions: [],
                onTheCrease: true,
                currentNonStriker: true,
                status: 'Not out'
              },
              {
                name: 'Player 3',
                index: 0,
                runs: 10,
                currentStriker: false,
                allActions: [],
                onTheCrease: false,
                currentNonStriker: false,
                status: 'Not out'
              },
              {
                name: 'Player 4',
                index: 0,
                runs: 10,
                currentStriker: false,
                allActions: [],
                onTheCrease: false,
                currentNonStriker: false,
                status: 'Not out'
              }
            ],
            name: 'Team 1',
            index: 0,
            totalRuns: 30,
            totalWickets: 2,
            overs: 5,
            currentBattingTeam: true,
            finishedBatting: false
          },
          {
            players: [
              {
                name: 'Player 1',
                index: 0,
                runs: 0,
                currentStriker: false,
                allActions: [],
                onTheCrease: false,
                currentNonStriker: true,
                status: 'Not out'
              }
            ],
            name: 'Team 2',
            index: 1,
            totalRuns: 0,
            totalWickets: 0,
            overs: 0,
            currentBattingTeam: false,
            finishedBatting: false
          }
        ]);
      }, []);

      const team1 = gameScore[0];
      const team2 = gameScore[1];

      return (
        <>
          {gameScore[0].finishedBatting && gameScore[1].finishedBatting && (
            <p>Game Over! {team1.totalRuns > team2.totalRuns ? 'Team 1' : 'Team 2'} wins!</p>
          )}
        </>
      );
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );
    expect(screen.queryByText('Game Over!')).not.toBeInTheDocument();
  });
});
