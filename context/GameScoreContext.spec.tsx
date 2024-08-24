import { render, screen } from '@testing-library/react';
import { GameScoreProvider, useGameScore, GameScoreContext, GameScore } from './GameScoreContext';
import React from 'react';
import testTeamData1 from '../__tests__/test-team-1.json';
import testTeamData2 from '../__tests__/test-team-2.json';

describe('GameScoreProvider', () => {
  it('should provide the correct initial context values', () => {
    const MockChildComponent = () => {
      const { gameScore } = useGameScore();

      return <div>{gameScore[0].players.length}</div>;
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );

    expect(screen.getByText('11')).toBeInTheDocument();
  });
  it('should process setGameScore correctly for team 1', () => {
    const MockChildComponent = () => {
      const { gameScore, setGameScore } = useGameScore();

      React.useEffect(() => {
        setGameScore([testTeamData1, testTeamData2] as unknown as GameScore);
      }, []);

      return <div>Runs: {gameScore[0].players[0]?.runs}</div>;
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );
    expect(screen.getByText('Runs: 10')).toBeInTheDocument();
  });

  it('should process setGameScore correctly for team 2', () => {
    const MockChildComponent = () => {
      const { gameScore, setBattingPlayerScore } = useGameScore();

      React.useEffect(() => {
        setBattingPlayerScore(1, 0, 4, null, false, false, null);
      }, []);

      return <div>Runs: {gameScore[1].players[0]?.runs}</div>;
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );
    expect(screen.queryByText('Runs: 4')).toBeInTheDocument();
  });

  it('should process setGameScore correctly for team 2 when there is a wicket', () => {
    const MockChildComponent = () => {
      const { gameScore, setBattingPlayerScore } = useGameScore();

      React.useEffect(() => {
        setBattingPlayerScore(1, 0, 4, null, false, false, null);
        setBattingPlayerScore(1, 0, 0, 'Wicket', false, false, 'LBW');
      }, []);

      return <div>Runs: {gameScore[1].players[0]?.runs}</div>;
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );
    expect(screen.queryByText('Runs: 4')).toBeInTheDocument();
  });

  it('should swap players if there is a wicket and if it is endOfOver', () => {
    const MockChildComponent = () => {
      const { gameScore, setBattingPlayerScore } = useGameScore();

      React.useEffect(() => {
        setBattingPlayerScore(0, 0, 0, 'Wicket', true, false, 'LBW');
      }, []);

      return (
        <div>
          <p>Player 0: {gameScore[0].players[0].status}</p>
          <p>Player 0 on the crease: {gameScore[0].players[0].onTheCrease ? 'true' : 'false'}</p>
          <p>
            Player 0 current striker: {gameScore[0].players[0].currentStriker ? 'true' : 'false'}
          </p>

          <p>Player 1: {gameScore[0].players[1].status}</p>
          <p>Player 1 on the crease: {gameScore[0].players[1].onTheCrease ? 'true' : 'false'}</p>
          <p>
            Player 1 current striker: {gameScore[0].players[1].currentStriker ? 'true' : 'false'}
          </p>
          <p>Player 2: {gameScore[0].players[2].status}</p>
          <p>Player 2 on the crease: {gameScore[0].players[2].onTheCrease ? 'true' : 'false'}</p>
          <p>
            Player 2 current striker: {gameScore[0].players[2].currentStriker ? 'true' : 'false'}
          </p>
        </div>
      );
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );
    expect(screen.getByText('Player 0: Out')).toBeInTheDocument();
    expect(screen.getByText('Player 0 on the crease: false')).toBeInTheDocument();
    expect(screen.getByText('Player 0 current striker: false')).toBeInTheDocument();
    expect(screen.getByText('Player 1: Not out')).toBeInTheDocument();
    expect(screen.getByText('Player 1 on the crease: true')).toBeInTheDocument();
    expect(screen.getByText('Player 1 current striker: false')).toBeInTheDocument();
    expect(screen.getByText('Player 2: Not out')).toBeInTheDocument();
    expect(screen.getByText('Player 2 on the crease: true')).toBeInTheDocument();
    expect(screen.getByText('Player 2 current striker: true')).toBeInTheDocument();
  });

  it('should swap batsmen if runs are odd', () => {
    const MockChildComponent = () => {
      const { gameScore, setBattingPlayerScore } = useGameScore();

      React.useEffect(() => {
        setBattingPlayerScore(0, 0, 1, null, false, false, null);
        setBattingPlayerScore(0, 0, 1, null, false, false, null);
      }, []);

      return (
        <div>
          <p>
            Player 0 current striker: {gameScore[0].players[0].currentStriker ? 'true' : 'false'}
          </p>
          <p>
            Player 0 current non-striker:{' '}
            {gameScore[0].players[0].currentNonStriker ? 'true' : 'false'}
          </p>
          <p>
            Player 1 current striker: {gameScore[0].players[1].currentStriker ? 'true' : 'false'}
          </p>
          <p>
            Player 1 current non-striker:{' '}
            {gameScore[0].players[1].currentNonStriker ? 'true' : 'false'}
          </p>
        </div>
      );
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );
    expect(screen.getByText('Player 0 current striker: false')).toBeInTheDocument();
    expect(screen.getByText('Player 0 current non-striker: true')).toBeInTheDocument();
    expect(screen.getByText('Player 1 current striker: true')).toBeInTheDocument();
    expect(screen.getByText('Player 1 current non-striker: false')).toBeInTheDocument();
  });

  it('should return without updating if the player index is invalid', () => {
    const MockChildComponent = () => {
      const { gameScore, setBattingPlayerScore } = useGameScore();

      React.useEffect(() => {
        setBattingPlayerScore(1, 11, 10, null, false, false, null);
      }, []);

      return <div>Runs: {gameScore[0].players[0]?.runs}</div>;
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );
    expect(screen.getByText('Runs: 0')).toBeInTheDocument();
  });

  it('should return without updating if the team index is invalid', () => {
    const MockChildComponent = () => {
      const { gameScore, setBattingPlayerScore } = useGameScore();

      React.useEffect(() => {
        setBattingPlayerScore(555, 0, 10, null, false, false, null);
      }, []);

      return <div>Runs: {gameScore[0].players[0]?.runs}</div>;
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );
    expect(screen.getByText('Runs: 0')).toBeInTheDocument();
  });

  it('should process setGameScore correctly for team 1 and team 2', () => {
    const MockChildComponent = () => {
      const { gameScore, setGameScore } = useGameScore();

      React.useEffect(() => {
        setGameScore([
          {
            players: [
              {
                name: 'Player 1',
                index: 0,
                runs: 22,
                wicketsTaken: 0,
                currentStriker: true,
                allActions: [],
                onTheCrease: true,
                currentNonStriker: false,
                currentBowler: false,
                status: 'Not out',
                methodOfWicket: null
              },
              {
                name: 'Player 2',
                index: 0,
                runs: 0,
                wicketsTaken: 0,
                currentStriker: false,
                allActions: [],
                onTheCrease: true,
                currentNonStriker: true,
                currentBowler: false,
                status: 'Not out',
                methodOfWicket: null
              },
              {
                name: 'Player 3',
                index: 0,
                runs: 10,
                wicketsTaken: 0,
                currentStriker: false,
                allActions: [],
                onTheCrease: false,
                currentNonStriker: false,
                currentBowler: false,
                status: 'Not out',
                methodOfWicket: null
              },
              {
                name: 'Player 4',
                index: 0,
                runs: 10,
                wicketsTaken: 0,
                currentStriker: false,
                allActions: [],
                onTheCrease: false,
                currentNonStriker: false,
                currentBowler: false,
                status: 'Not out',
                methodOfWicket: null
              }
            ],
            name: 'Team 1',
            index: 0,
            totalRuns: 32,
            totalWicketsConceded: 2,
            totalWicketsTaken: 0,
            overs: 5,
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
                currentStriker: false,
                allActions: [],
                onTheCrease: false,
                currentNonStriker: true,
                currentBowler: false,
                status: 'Not out',
                methodOfWicket: null
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
        ]);
      }, []);

      return (
        <div>
          Runs: {gameScore[0].players[0]?.runs}, {gameScore[1].players[0]?.runs}
        </div>
      );
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );
    expect(screen.getByText('Runs: 22, 0')).toBeInTheDocument();
  });

  it('should set the first player as the current striker if no player is currently the striker', () => {
    const MockChildComponent = () => {
      const { gameScore, setGameScore } = useGameScore();

      React.useEffect(() => {
        setGameScore([
          {
            players: [
              {
                name: 'Player 1',
                index: 0,
                runs: 22,
                wicketsTaken: 0,
                currentStriker: false,
                allActions: [],
                onTheCrease: true,
                currentNonStriker: false,
                currentBowler: false,
                status: 'Not out',
                methodOfWicket: null
              },
              {
                name: 'Player 2',
                index: 0,
                runs: 0,
                wicketsTaken: 0,
                currentStriker: false,
                allActions: [],
                onTheCrease: true,
                currentNonStriker: true,
                currentBowler: false,
                status: 'Not out',
                methodOfWicket: null
              },
              {
                name: 'Player 3',
                index: 0,
                runs: 10,
                wicketsTaken: 0,
                currentStriker: false,
                allActions: [],
                onTheCrease: false,
                currentNonStriker: false,
                currentBowler: false,
                status: 'Not out',
                methodOfWicket: null
              },
              {
                name: 'Player 4',
                index: 0,
                runs: 10,
                wicketsTaken: 0,
                currentStriker: false,
                allActions: [],
                onTheCrease: false,
                currentNonStriker: false,
                currentBowler: false,
                status: 'Not out',
                methodOfWicket: null
              }
            ],
            name: 'Team 1',
            index: 0,
            totalRuns: 32,
            totalWicketsConceded: 2,
            totalWicketsTaken: 0,
            overs: 5,
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
                currentStriker: false,
                allActions: [],
                onTheCrease: false,
                currentNonStriker: true,
                currentBowler: false,
                status: 'Not out',
                methodOfWicket: null
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
        ]);
      }, []);

      return <div>{gameScore[0].players[0]?.currentStriker ? 'true' : 'false'}</div>;
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  it('should set current striker when a wicket occurs', () => {
    const MockChildComponent = () => {
      const { gameScore, setBattingPlayerScore } = useGameScore();

      React.useEffect(() => {
        setBattingPlayerScore(0, 0, 10, 'Wicket', false, false, 'LBW');
      }, []);

      return (
        <div>
          <p>Player 0: {gameScore[0].players[0].status}</p>
          <p>Player 0 on the crease: {gameScore[0].players[0].onTheCrease ? 'true' : 'false'}</p>
          <p>
            Player 0 current striker: {gameScore[0].players[0].currentStriker ? 'true' : 'false'}
          </p>

          <p>Player 2: {gameScore[0].players[2].status}</p>
          <p>Player 2 on the crease: {gameScore[0].players[2].onTheCrease ? 'true' : 'false'}</p>
          <p>
            Player 2 current striker: {gameScore[0].players[2].currentStriker ? 'true' : 'false'}
          </p>
        </div>
      );
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );
    expect(screen.getByText('Player 0: Out')).toBeInTheDocument();
    expect(screen.getByText('Player 0 on the crease: false')).toBeInTheDocument();
    expect(screen.getByText('Player 0 current striker: false')).toBeInTheDocument();
    expect(screen.getByText('Player 2: Not out')).toBeInTheDocument();
    expect(screen.getByText('Player 2 on the crease: true')).toBeInTheDocument();
    expect(screen.getByText('Player 2 current striker: true')).toBeInTheDocument();
  });

  it('should process pointless initial setGameScore correctly', () => {
    const logSpy = jest.spyOn(console, 'log');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    logSpy.mockImplementation(() => {});

    const TestComponent = () => {
      const { setGameScore, setBattingPlayerScore, swapBatsmen } =
        React.useContext(GameScoreContext);

      setGameScore([
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
              status: 'Not out',
              methodOfWicket: null
            },
            {
              name: 'Player 2',
              index: 0,
              runs: 0,
              wicketsTaken: 0,
              currentStriker: false,
              allActions: [],
              onTheCrease: true,
              currentNonStriker: true,
              currentBowler: false,
              status: 'Not out',
              methodOfWicket: null
            },
            {
              name: 'Player 3',
              index: 0,
              runs: 0,
              wicketsTaken: 0,
              currentStriker: false,
              allActions: [],
              onTheCrease: false,
              currentNonStriker: false,
              currentBowler: false,
              status: 'Not out',
              methodOfWicket: null
            },
            {
              name: 'Player 4',
              index: 0,
              runs: 0,
              wicketsTaken: 0,
              currentStriker: false,
              allActions: [],
              onTheCrease: false,
              currentNonStriker: false,
              currentBowler: false,
              status: 'Not out',
              methodOfWicket: null
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
              currentStriker: false,
              allActions: [],
              onTheCrease: false,
              currentNonStriker: true,
              currentBowler: false,
              status: 'Not out',
              methodOfWicket: null
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
      ]);
      const currentStriker = {
        name: 'Player 1',
        index: 0,
        runs: 0,
        wicketsTaken: 0,
        currentStriker: true,
        currentBowler: false,
        allActions: [],
        onTheCrease: true,
        currentNonStriker: false,
        status: 'Not out',
        methodOfWicket: null
      };
      const currentNonStriker = {
        name: 'Player 2',
        index: 0,
        runs: 0,
        wicketsTaken: 0,
        currentStriker: false,

        currentBowler: false,
        allActions: [],
        onTheCrease: true,
        currentNonStriker: true,
        status: 'Not out',
        methodOfWicket: null
      };
      setBattingPlayerScore(0, 0, 10, null, false, false, null);
      swapBatsmen(currentStriker, currentNonStriker);

      return null;
    };

    render(<TestComponent />);

    expect(logSpy).toHaveBeenCalledWith('Initial setGameScore called with', [
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
            status: 'Not out',
            methodOfWicket: null
          },
          {
            name: 'Player 2',
            index: 0,
            runs: 0,
            wicketsTaken: 0,
            currentStriker: false,
            currentBowler: false,
            allActions: [],
            onTheCrease: true,
            currentNonStriker: true,
            status: 'Not out',
            methodOfWicket: null
          },
          {
            name: 'Player 3',
            index: 0,
            runs: 0,
            wicketsTaken: 0,
            currentStriker: false,
            currentBowler: false,
            allActions: [],
            onTheCrease: false,
            currentNonStriker: false,
            status: 'Not out',
            methodOfWicket: null
          },
          {
            name: 'Player 4',
            index: 0,
            runs: 0,
            wicketsTaken: 0,
            currentStriker: false,
            currentBowler: false,
            allActions: [],
            onTheCrease: false,
            currentNonStriker: false,
            status: 'Not out',
            methodOfWicket: null
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
            currentStriker: false,
            allActions: [],
            onTheCrease: false,
            currentNonStriker: true,
            currentBowler: false,
            status: 'Not out',
            methodOfWicket: null
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
    ]);
    expect(logSpy).toHaveBeenCalledWith('Initial setBattingPlayerScore called with', 0);
    expect(logSpy).toHaveBeenCalledWith('Initial swapBatsmen called');

    logSpy.mockRestore();
  });

  it('should add each action to allActions', () => {
    const MockChildComponent = () => {
      const { gameScore, setBattingPlayerScore } = useGameScore();

      React.useEffect(() => {
        setBattingPlayerScore(0, 0, 1, null, false, false, null);
        setBattingPlayerScore(0, 0, 4, null, false, false, null);
        setBattingPlayerScore(0, 0, 1, 'No ball', false, false, null);
      }, []);

      return <div>{gameScore[0].players[0]?.allActions.join(', ')}</div>;
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );
    expect(screen.getByText('1, 4, No ball')).toBeInTheDocument();
  });

  it('should swap the current striker and non-striker', () => {
    const MockChildComponent = () => {
      const { gameScore, swapBatsmen } = useGameScore();
      const currentStriker = gameScore[0].players.find((player) => player.currentStriker);
      const currentNonStriker = gameScore[0].players.find((player) => player.currentNonStriker);

      if (!currentStriker || !currentNonStriker) {
        return <div>Players not found</div>;
      }

      React.useEffect(() => {
        swapBatsmen(currentStriker, currentNonStriker);
      }, []);

      return (
        <div>
          <p>
            Player 0 current striker: {gameScore[0].players[0].currentStriker ? 'true' : 'false'}
          </p>
          <p>
            Player 0 current non-striker:{' '}
            {gameScore[0].players[0].currentNonStriker ? 'true' : 'false'}
          </p>
          <p>
            Player 1 current striker: {gameScore[0].players[1].currentStriker ? 'true' : 'false'}
          </p>
          <p>
            Player 1 current non-striker:{' '}
            {gameScore[0].players[1].currentNonStriker ? 'true' : 'false'}
          </p>
        </div>
      );
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );
    expect(screen.getByText('Player 0 current striker: false')).toBeInTheDocument();
    expect(screen.getByText('Player 0 current non-striker: true')).toBeInTheDocument();
    expect(screen.getByText('Player 1 current striker: true')).toBeInTheDocument();
    expect(screen.getByText('Player 1 current non-striker: false')).toBeInTheDocument();
  });
});
