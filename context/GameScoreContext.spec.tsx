import { render, screen } from '@testing-library/react';
import { GameScoreProvider, useGameScore, GameScoreContext } from './GameScoreContext';
import React from 'react';

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
        setGameScore([
          {
            players: [{ name: 'Player 1', index: 0, runs: 10, isBatting: true, allActions: [] }],
            name: 'Team 1',
            index: 0
          },
          {
            players: [{ name: 'Player 1', index: 0, runs: 0, isBatting: false, allActions: [] }],
            name: 'Team 2',
            index: 1
          }
        ]);
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
      const { gameScore, setPlayerScore } = useGameScore();

      React.useEffect(() => {
        setPlayerScore(1, 0, 4, null);
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

  it('should return without updating if the player index is invalid', () => {
    const MockChildComponent = () => {
      const { gameScore, setPlayerScore } = useGameScore();

      React.useEffect(() => {
        setPlayerScore(1, 11, 10, null);
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
      const { gameScore, setPlayerScore } = useGameScore();

      React.useEffect(() => {
        setPlayerScore(555, 0, 10, null);
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
            players: [{ name: 'Player 1', index: 0, runs: 22, isBatting: true, allActions: [] }],
            name: 'Team 1',
            index: 0
          },
          {
            players: [{ name: 'Player 1', index: 0, runs: 0, isBatting: false, allActions: [] }],
            name: 'Team 2',
            index: 1
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

  it('should process pointless initial setGameScore correctly', () => {
    const logSpy = jest.spyOn(console, 'log');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    logSpy.mockImplementation(() => {});

    const TestComponent = () => {
      const { setGameScore, setPlayerScore } = React.useContext(GameScoreContext);

      setGameScore([
        {
          players: [{ name: 'Player 122222', index: 0, runs: 0, isBatting: true, allActions: [] }],
          name: 'Team 1',
          index: 0
        },
        {
          players: [{ name: 'Player 1', index: 0, runs: 0, isBatting: false, allActions: [] }],
          name: 'Team 2',
          index: 1
        }
      ]);
      setPlayerScore(0, 0, 10, null);

      return null;
    };

    render(<TestComponent />);

    expect(logSpy).toHaveBeenCalledWith('Initial setGameScore called with', [
      {
        players: [{ name: 'Player 1', index: 0, runs: 0, isBatting: true, allActions: [] }],
        name: 'Team 1',
        index: 0
      },
      {
        players: [{ name: 'Player 1', index: 0, runs: 0, isBatting: false, allActions: [] }],
        name: 'Team 2',
        index: 1
      }
    ]);
    expect(logSpy).toHaveBeenCalledWith('Initial setPlayerScore called with', 0);

    logSpy.mockRestore();
  });

  it('should add each action to allActions', () => {
    const MockChildComponent = () => {
      const { gameScore, setPlayerScore } = useGameScore();

      React.useEffect(() => {
        setPlayerScore(0, 0, 1, null);
        setPlayerScore(0, 0, 4, null);
        setPlayerScore(0, 0, 1, 'No ball');
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
});
