import { render, screen } from '@testing-library/react';
import { GameScoreProvider, useGameScore } from './GameScoreContext';
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
      const { gameScore, setGameScore } = useGameScore();

      React.useEffect(() => {
        setGameScore(1, 0, 10);
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
      const { gameScore, setGameScore } = useGameScore();

      React.useEffect(() => {
        setGameScore(2, 0, 4);
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
      const { gameScore, setGameScore } = useGameScore();

      React.useEffect(() => {
        setGameScore(1, 11, 10);
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
      const { gameScore, setGameScore } = useGameScore();

      React.useEffect(() => {
        setGameScore(555, 0, 10);
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
});
