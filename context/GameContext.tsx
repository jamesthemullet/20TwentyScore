import React, { createContext, useContext, useMemo, useReducer } from 'react';
import defaultPlayers from '../components/core/players';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TeamPlayer = {
  index: number;
  name: string;
  runs: number;
  wicketsTaken: number;
  currentStriker: boolean;
  allActions: (string | null)[];
  currentNonStriker: boolean;
  currentBowler: boolean;
  onTheCrease: boolean;
  status: string;
  methodOfWicket: 'LBW' | 'Caught' | 'Run Out' | null;
  oversBowled: number;
};

export type Team = {
  players: TeamPlayer[];
  name: 'Team 1' | 'Team 2';
  index: 0 | 1;
  totalRuns: number;
  totalWicketsConceded: number;
  totalWicketsTaken: number;
  overs: number;
  currentBattingTeam: boolean;
  currentBowlingTeam: boolean;
  finishedBatting: boolean;
};

export type GameScore = [Team, Team];

export type GameScoreContextType = {
  gameScore: GameScore;
  setGameScore: (gameScore: GameScore) => void;
  setBattingPlayerScore: (
    teamIndex: number,
    playerIndex: number,
    runs: number,
    action: string | null,
    endOfOver: boolean,
    endOfInnings: boolean,
    methodOfWicket: 'LBW' | 'Caught' | 'Run Out' | null
  ) => void;
  setBowlingPlayerScore: (action: string | null, endOfOver: boolean) => void;
  swapBatsmen: () => void;
  setCurrentBowler: (teamIndex: number, playerIndex: number) => void;
};

export type OversContextType = {
  currentExtrasInThisOver: number;
  setCurrentExtrasInThisOver: (extras: number | string) => void;
  currentBallInThisOver: number;
  setCurrentBallInThisOver: (ball: number | null) => void;
  currentOver: number;
  setCurrentOvers: (inc: number | undefined) => void;
  resetOvers: () => void;
};

export type MostRecentActionContextType = {
  mostRecentAction: { runs: number; action: string | null };
  setMostRecentAction: (mostRecentAction: { runs: number; action: string | null }) => void;
};

// ── State ─────────────────────────────────────────────────────────────────────

type GameState = {
  teams: GameScore;
  currentOver: number;
  currentBallInThisOver: number;
  currentExtrasInThisOver: number;
  mostRecentAction: { runs: number; action: string | null };
};

type GameAction =
  | { type: 'SET_GAME_SCORE'; payload: GameScore }
  | {
      type: 'SET_BATTING_PLAYER_SCORE';
      payload: {
        teamIndex: number;
        playerIndex: number;
        runs: number;
        action: string | null;
        endOfOver: boolean;
        endOfInnings: boolean;
        methodOfWicket: 'LBW' | 'Caught' | 'Run Out' | null;
      };
    }
  | { type: 'SET_BOWLING_PLAYER_SCORE'; payload: { action: string | null; endOfOver: boolean } }
  | { type: 'SWAP_BATSMEN' }
  | { type: 'SET_CURRENT_BOWLER'; payload: { teamIndex: number; playerIndex: number } }
  | { type: 'SET_EXTRAS_IN_OVER'; payload: number | 'reset' }
  | { type: 'SET_BALL_IN_OVER'; payload: number | null }
  | { type: 'INCREMENT_OVER' }
  | { type: 'RESET_OVERS' }
  | { type: 'SET_MOST_RECENT_ACTION'; payload: { runs: number; action: string | null } };

const makeInitialTeams = (): GameScore => [
  {
    players: defaultPlayers(),
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
    players: defaultPlayers(),
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
];

const initialState: GameState = {
  teams: makeInitialTeams(),
  currentOver: 1,
  currentBallInThisOver: 1,
  currentExtrasInThisOver: 0,
  mostRecentAction: { runs: 0, action: null }
};

// ── Reducer helpers ───────────────────────────────────────────────────────────

function swapStrikers(players: TeamPlayer[]): TeamPlayer[] {
  return players.map((p) => ({
    ...p,
    currentStriker: p.currentNonStriker,
    currentNonStriker: p.currentStriker
  }));
}

function applyBattingUpdate(
  players: TeamPlayer[],
  playerIndex: number,
  runs: number,
  action: string | null,
  endOfOver: boolean,
  methodOfWicket: 'LBW' | 'Caught' | 'Run Out' | null
): TeamPlayer[] | null {
  const playerExists = players.some((p) => p.index === playerIndex);
  if (!playerExists) return null;

  let updated = players.map((p) =>
    p.index === playerIndex
      ? { ...p, runs: p.runs + runs, allActions: [...p.allActions, action || runs.toString()] }
      : p
  );

  if (action === 'Wicket') {
    updated = updated.map((p) =>
      p.index === playerIndex
        ? {
            ...p,
            status: 'Out',
            onTheCrease: false,
            currentStriker: false,
            currentNonStriker: false,
            methodOfWicket
          }
        : p
    );

    const nextPlayer = updated.find((p) => p.status !== 'Out' && !p.onTheCrease);
    if (nextPlayer) {
      updated = updated.map((p) =>
        p.index === nextPlayer.index ? { ...p, onTheCrease: true, currentStriker: true } : p
      );
    }

    if (endOfOver) {
      updated = swapStrikers(updated);
    }
  } else if (runs % 2 !== 0) {
    updated = swapStrikers(updated);
  }

  return updated;
}

function applyBowlingUpdate(
  players: TeamPlayer[],
  action: string | null,
  endOfOver: boolean
): TeamPlayer[] {
  const currentBowler = players.find((p) => p.currentBowler);
  if (!currentBowler) return players;

  return players.map((p) =>
    p === currentBowler
      ? {
          ...p,
          wicketsTaken: p.wicketsTaken + (action === 'Wicket' ? 1 : 0),
          allActions: [...p.allActions, action || ''],
          oversBowled: endOfOver ? p.oversBowled + 1 : p.oversBowled
        }
      : p
  );
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_GAME_SCORE': {
      const teams = action.payload;
      const battingTeamIndex = teams.findIndex((t) => t.currentBattingTeam);

      if (battingTeamIndex !== -1 && !teams[battingTeamIndex].players.find((p) => p.currentStriker)) {
        const updatedTeams = [...teams] as GameScore;
        updatedTeams[battingTeamIndex as 0 | 1] = {
          ...updatedTeams[battingTeamIndex as 0 | 1],
          players: updatedTeams[battingTeamIndex as 0 | 1].players.map((p, i) =>
            i === 0 ? { ...p, currentStriker: true } : p
          )
        };
        return { ...initialState, teams: updatedTeams };
      }

      return { ...initialState, teams };
    }

    case 'SET_BATTING_PLAYER_SCORE': {
      const { teamIndex, playerIndex, runs, action: ballAction, endOfOver, endOfInnings, methodOfWicket } =
        action.payload;

      if (teamIndex < 0 || teamIndex > 1) return state;

      const teams = [...state.teams] as GameScore;
      const team = teams[teamIndex as 0 | 1];

      const updatedPlayers = applyBattingUpdate(
        team.players,
        playerIndex,
        runs,
        ballAction,
        endOfOver,
        methodOfWicket
      );

      if (updatedPlayers === null) return state;

      teams[teamIndex as 0 | 1] = {
        ...team,
        players: updatedPlayers,
        totalRuns: team.totalRuns + runs,
        totalWicketsConceded: team.totalWicketsConceded + (ballAction === 'Wicket' ? 1 : 0),
        overs: endOfOver ? team.overs + 1 : team.overs,
        currentBattingTeam: endOfInnings ? !team.currentBattingTeam : team.currentBattingTeam,
        finishedBatting: team.finishedBatting || endOfInnings
      };

      if (endOfInnings) {
        const otherIndex = (teamIndex === 0 ? 1 : 0) as 0 | 1;
        teams[otherIndex] = {
          ...teams[otherIndex],
          currentBattingTeam: !teams[otherIndex].currentBattingTeam
        };
      }

      return { ...state, teams };
    }

    case 'SET_BOWLING_PLAYER_SCORE': {
      const { action: ballAction, endOfOver } = action.payload;
      const bowlingTeamIndex = state.teams.findIndex((t) => t.currentBowlingTeam);

      if (bowlingTeamIndex === -1) return state;

      const teams = [...state.teams] as GameScore;
      teams[bowlingTeamIndex] = {
        ...teams[bowlingTeamIndex],
        players: applyBowlingUpdate(teams[bowlingTeamIndex].players, ballAction, endOfOver),
        totalWicketsTaken:
          teams[bowlingTeamIndex].totalWicketsTaken + (ballAction === 'Wicket' ? 1 : 0)
      };

      return { ...state, teams };
    }

    case 'SWAP_BATSMEN': {
      const battingTeamIndex = state.teams.findIndex((t) => t.currentBattingTeam);
      if (battingTeamIndex === -1) return state;

      const teams = [...state.teams] as GameScore;
      teams[battingTeamIndex] = {
        ...teams[battingTeamIndex],
        players: swapStrikers(teams[battingTeamIndex].players)
      };

      return { ...state, teams };
    }

    case 'SET_CURRENT_BOWLER': {
      const { teamIndex, playerIndex } = action.payload;
      if (teamIndex < 0 || teamIndex > 1) return state;

      const teams = [...state.teams] as GameScore;
      teams[teamIndex as 0 | 1] = {
        ...teams[teamIndex as 0 | 1],
        players: teams[teamIndex as 0 | 1].players.map((p) => ({
          ...p,
          currentBowler: p.index === playerIndex
        }))
      };

      return { ...state, teams };
    }

    case 'SET_EXTRAS_IN_OVER':
      return {
        ...state,
        currentExtrasInThisOver:
          action.payload === 'reset'
            ? 0
            : state.currentExtrasInThisOver + Number(action.payload)
      };

    case 'SET_BALL_IN_OVER':
      return {
        ...state,
        currentBallInThisOver:
          action.payload !== null ? action.payload : state.currentBallInThisOver + 1
      };

    case 'INCREMENT_OVER':
      return { ...state, currentOver: state.currentOver + 1 };

    case 'RESET_OVERS':
      return {
        ...state,
        currentOver: 1,
        currentBallInThisOver: 1,
        currentExtrasInThisOver: 0
      };

    case 'SET_MOST_RECENT_ACTION':
      return { ...state, mostRecentAction: action.payload };

    default:
      return state;
  }
}

// ── Contexts ──────────────────────────────────────────────────────────────────

export const GameScoreContext = createContext<GameScoreContextType>({
  gameScore: makeInitialTeams(),
  setGameScore: () => undefined,
  setBattingPlayerScore: () => undefined,
  setBowlingPlayerScore: () => undefined,
  swapBatsmen: () => undefined,
  setCurrentBowler: () => undefined
});

export const OversContext = createContext<OversContextType>({
  currentExtrasInThisOver: 0,
  setCurrentExtrasInThisOver: () => undefined,
  currentBallInThisOver: 1,
  setCurrentBallInThisOver: () => undefined,
  currentOver: 1,
  setCurrentOvers: () => undefined,
  resetOvers: () => undefined
});

export const MostRecentActionContext = createContext<MostRecentActionContextType>({
  mostRecentAction: { runs: 0, action: null },
  setMostRecentAction: () => undefined
});

// ── Provider ──────────────────────────────────────────────────────────────────

type GameProviderProps = { children: React.ReactNode };

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const gameScoreValue = useMemo<GameScoreContextType>(
    () => ({
      gameScore: state.teams,
      setGameScore: (gs) => dispatch({ type: 'SET_GAME_SCORE', payload: gs }),
      setBattingPlayerScore: (teamIndex, playerIndex, runs, action, endOfOver, endOfInnings, methodOfWicket) =>
        dispatch({
          type: 'SET_BATTING_PLAYER_SCORE',
          payload: { teamIndex, playerIndex, runs, action, endOfOver, endOfInnings, methodOfWicket }
        }),
      setBowlingPlayerScore: (action, endOfOver) =>
        dispatch({ type: 'SET_BOWLING_PLAYER_SCORE', payload: { action, endOfOver } }),
      swapBatsmen: () => dispatch({ type: 'SWAP_BATSMEN' }),
      setCurrentBowler: (teamIndex, playerIndex) =>
        dispatch({ type: 'SET_CURRENT_BOWLER', payload: { teamIndex, playerIndex } })
    }),
    [state.teams]
  );

  const oversValue = useMemo<OversContextType>(
    () => ({
      currentExtrasInThisOver: state.currentExtrasInThisOver,
      setCurrentExtrasInThisOver: (extras) =>
        dispatch({ type: 'SET_EXTRAS_IN_OVER', payload: extras as number | 'reset' }),
      currentBallInThisOver: state.currentBallInThisOver,
      setCurrentBallInThisOver: (ball) => dispatch({ type: 'SET_BALL_IN_OVER', payload: ball }),
      currentOver: state.currentOver,
      setCurrentOvers: (inc) =>
        dispatch({ type: inc === undefined ? 'INCREMENT_OVER' : 'RESET_OVERS' }),
      resetOvers: () => dispatch({ type: 'RESET_OVERS' })
    }),
    [state.currentExtrasInThisOver, state.currentBallInThisOver, state.currentOver]
  );

  const mostRecentActionValue = useMemo<MostRecentActionContextType>(
    () => ({
      mostRecentAction: state.mostRecentAction,
      setMostRecentAction: (mostRecentAction) =>
        dispatch({ type: 'SET_MOST_RECENT_ACTION', payload: mostRecentAction })
    }),
    [state.mostRecentAction]
  );

  return (
    <GameScoreContext.Provider value={gameScoreValue}>
      <OversContext.Provider value={oversValue}>
        <MostRecentActionContext.Provider value={mostRecentActionValue}>
          {children}
        </MostRecentActionContext.Provider>
      </OversContext.Provider>
    </GameScoreContext.Provider>
  );
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

export const useGameScore = () => useContext(GameScoreContext);
export const useOvers = () => useContext(OversContext);
export const useMostRecentAction = () => useContext(MostRecentActionContext);
