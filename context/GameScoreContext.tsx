import React, { createContext, useContext, useState } from 'react';
import defaultPlayers from '../components/players';

type TeamPlayer = {
  index: number;
  name: string;
  runs: number;
};

export type GameScore = {
  team1Players: TeamPlayer[];
  team2Players: TeamPlayer[];
};

export type PlayerScore = {
  team1Players: TeamPlayer[];
  team2Players: TeamPlayer[];
};

type GameScoreContextType = {
  gameScore: GameScore;
  setGameScore: (gameScore: GameScore) => void;
  setPlayerScore: (teamIndex: number, playerIndex: number, runs: number) => void;
};

type GameScoreProviderProps = {
  children: React.ReactNode;
};

export const GameScoreContext = createContext<GameScoreContextType>({
  gameScore: {
    team1Players: [],
    team2Players: []
  },
  setGameScore: (gameScore) => {
    console.log('Initial setGameScore called with', gameScore);
  },
  setPlayerScore: (playerScore) => {
    console.log('Initial setPlayerScore called with', playerScore);
  }
});

export const useGameScore = () => useContext(GameScoreContext);

export const GameScoreProvider: React.FC<GameScoreProviderProps> = ({ children }) => {
  const [gameScore, setGameScoreState] = useState<GameScore>({
    team1Players: defaultPlayers(),
    team2Players: defaultPlayers()
  });

  const updateTeamScore = (teamPlayers: TeamPlayer[], playerIndex: number, runs: number) => {
    const player = teamPlayers.find((player) => player.index === playerIndex);

    if (!player) {
      return teamPlayers;
    }

    const updatedTeamPlayers = teamPlayers.map((player) =>
      player.index === playerIndex ? { ...player, runs: player.runs + runs } : player
    );

    return updatedTeamPlayers;
  };

  const setPlayerScore = (teamIndex: number, playerIndex: number, runs: number) => {
    setGameScoreState((prevState: PlayerScore) => {
      if (teamIndex === 1) {
        return {
          ...prevState,
          team1Players: updateTeamScore(prevState.team1Players, playerIndex, runs)
        };
      } else if (teamIndex === 2) {
        return {
          ...prevState,
          team2Players: updateTeamScore(prevState.team2Players, playerIndex, runs)
        };
      } else {
        return prevState;
      }
    });
  };

  const setGameScore = (gameScore: GameScore) => {
    setGameScoreState(gameScore);
  };

  return (
    <GameScoreContext.Provider value={{ gameScore, setGameScore, setPlayerScore }}>
      {children}
    </GameScoreContext.Provider>
  );
};
