import { render, screen } from '@testing-library/react';
import { GameScoreProvider, useGameScore, GameScoreContext } from './GameScoreContext';
import React from 'react';

describe('GameScoreProvider', () => {
  it('should provide the correct initial context values', () => {
    const MockChildComponent = () => {
      const { gameScore } = useGameScore();

      return <div>{gameScore.team1Players.length}</div>;
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
      const { gameScore, setPlayerScore } = useGameScore();

      React.useEffect(() => {
        setPlayerScore(1, 0, 10);
      }, []);

      return <div>Runs: {gameScore.team1Players[0]?.runs}</div>;
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
        setPlayerScore(2, 0, 4);
      }, []);

      return <div>Runs: {gameScore.team2Players[0]?.runs}</div>;
    };
    render(
      <GameScoreProvider>
        <MockChildComponent />
      </GameScoreProvider>
    );
    expect(screen.getByText('Runs: 4')).toBeInTheDocument();
  });

  it('should return without updating if the player index is invalid', () => {
    const MockChildComponent = () => {
      const { gameScore, setPlayerScore } = useGameScore();

      React.useEffect(() => {
        setPlayerScore(1, 11, 10);
      }, []);

      return <div>Runs: {gameScore.team1Players[0]?.runs}</div>;
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
        setPlayerScore(555, 0, 10);
      }, []);

      return <div>Runs: {gameScore.team1Players[0]?.runs}</div>;
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
        setGameScore({
          team1Players: [{ name: 'Player 1', index: 0, runs: 22 }],
          team2Players: [{ name: 'Player 1', index: 0, runs: 0 }]
        });
      }, []);

      return (
        <div>
          Runs: {gameScore.team1Players[0]?.runs}, {gameScore.team2Players[0]?.runs}
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

      setGameScore({
        team1Players: [{ name: 'Player 1', index: 0, runs: 0 }],
        team2Players: [{ name: 'Player 1', index: 0, runs: 0 }]
      });
      setPlayerScore(0, 0, 10);

      return null;
    };

    render(<TestComponent />);

    expect(logSpy).toHaveBeenCalledWith('Initial setGameScore called with', {
      team1Players: [{ name: 'Player 1', index: 0, runs: 0 }],
      team2Players: [{ name: 'Player 1', index: 0, runs: 0 }]
    });
    expect(logSpy).toHaveBeenCalledWith('Initial setPlayerScore called with', 0);

    logSpy.mockRestore();
  });
});
