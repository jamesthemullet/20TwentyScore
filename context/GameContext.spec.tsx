import { render, screen } from '@testing-library/react';
import React from 'react';
import { makeInitialTeams, useGameScore, useMostRecentAction, useOvers } from './GameContext';

describe('makeInitialTeams', () => {
  it('defaults team names and player rosters when no setup is given', () => {
    const [team1, team2] = makeInitialTeams();

    expect(team1.name).toBe('Team 1');
    expect(team1.index).toBe(0);
    expect(team1.currentBattingTeam).toBe(true);
    expect(team1.currentBowlingTeam).toBe(false);
    expect(team1.players).toHaveLength(11);

    expect(team2.name).toBe('Team 2');
    expect(team2.index).toBe(1);
    expect(team2.currentBattingTeam).toBe(false);
    expect(team2.currentBowlingTeam).toBe(true);
    expect(team2.players).toHaveLength(11);
  });

  it('uses the given team names, trimmed of whitespace', () => {
    const [team1, team2] = makeInitialTeams({ name: '  Rovers  ' }, { name: '  City  ' });

    expect(team1.name).toBe('Rovers');
    expect(team2.name).toBe('City');
  });

  it('falls back to the default name when a team name is blank', () => {
    const [team1, team2] = makeInitialTeams({ name: '   ' }, {});

    expect(team1.name).toBe('Team 1');
    expect(team2.name).toBe('Team 2');
  });

  it('builds player rosters from the given player names', () => {
    const [team1] = makeInitialTeams({ playerNames: ['Alice', 'Bob'] });

    expect(team1.players[0]?.name).toBe('Alice');
    expect(team1.players[1]?.name).toBe('Bob');
  });
});

describe('useGameScore default value (no GameProvider)', () => {
  it('exposes no-op setters and a fresh game score', () => {
    const MockChildComponent = () => {
      const {
        gameScore,
        setGameScore,
        setBattingPlayerScore,
        setBowlingPlayerScore,
        swapBatsmen,
        setCurrentBowler,
        undo,
        canUndo
      } = useGameScore();

      React.useEffect(() => {
        setGameScore(gameScore);
        setBattingPlayerScore(0, 0, 4, null, false, false, null);
        setBowlingPlayerScore(null, 0, false);
        swapBatsmen();
        setCurrentBowler(0, 0);
        undo();
      }, []);

      return (
        <div>
          Players: {gameScore[0].players.length}, canUndo: {String(canUndo)}
        </div>
      );
    };

    render(<MockChildComponent />);

    expect(screen.getByText('Players: 11, canUndo: false')).toBeInTheDocument();
  });
});

describe('useOvers default value (no GameProvider)', () => {
  it('exposes no-op setters and default over/ball/extras counters', () => {
    const MockChildComponent = () => {
      const {
        currentExtrasInThisOver,
        setCurrentExtrasInThisOver,
        currentBallInThisOver,
        setCurrentBallInThisOver,
        currentOver,
        setCurrentOvers,
        resetOvers
      } = useOvers();

      React.useEffect(() => {
        setCurrentExtrasInThisOver(1);
        setCurrentBallInThisOver(2);
        setCurrentOvers(1);
        resetOvers();
      }, []);

      return (
        <div>
          Over: {currentOver}, Ball: {currentBallInThisOver}, Extras: {currentExtrasInThisOver}
        </div>
      );
    };

    render(<MockChildComponent />);

    expect(screen.getByText('Over: 1, Ball: 1, Extras: 0')).toBeInTheDocument();
  });
});

describe('useMostRecentAction default value (no GameProvider)', () => {
  it('exposes a no-op setter and a default action', () => {
    const MockChildComponent = () => {
      const { mostRecentAction, setMostRecentAction } = useMostRecentAction();

      React.useEffect(() => {
        setMostRecentAction({ runs: 4, action: 'Four' });
      }, []);

      return (
        <div>
          Runs: {mostRecentAction.runs}, Action: {String(mostRecentAction.action)}
        </div>
      );
    };

    render(<MockChildComponent />);

    expect(screen.getByText('Runs: 0, Action: null')).toBeInTheDocument();
  });
});
