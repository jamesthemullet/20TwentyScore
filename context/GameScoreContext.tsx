import React, { createContext, useContext, useState } from 'react';
import defaultPlayers from '../components/players';

type TeamPlayer = {
  index: number;
  name: string;
  runs: number;
};

export type GameScore = [
  {
    team1Players: TeamPlayer[];
    name: 'Team 1';
    index: 0;
  },
  {
    team2Players: TeamPlayer[];
    name: 'Team 2';
    index: 1;
  }
];

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
  gameScore: [
    {
      team1Players: [],
      name: 'Team 1',
      index: 0
    },
    {
      team2Players: [],
      name: 'Team 2',
      index: 1
    }
  ],
  setGameScore: (gameScore) => {
    console.log('Initial setGameScore called with', gameScore);
  },
  setPlayerScore: (playerScore) => {
    console.log('Initial setPlayerScore called with', playerScore);
  }
});

export const useGameScore = () => useContext(GameScoreContext);

export const GameScoreProvider: React.FC<GameScoreProviderProps> = ({ children }) => {
  const [gameScore, setGameScoreState] = useState<GameScore>([
    {
      team1Players: defaultPlayers(),
      name: 'Team 1',
      index: 0
    },
    {
      team2Players: defaultPlayers(),
      name: 'Team 2',
      index: 1
    }
  ]);

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
    console.log(1, teamIndex, playerIndex, runs);
    if (teamIndex < 0 || teamIndex > 1) {
      return;
    }
    setGameScoreState((prevState: GameScore) => {
      return [
        {
          team1Players: updateTeamScore(prevState[0].team1Players, playerIndex, runs),
          name: 'Team 1',
          index: 0
        },
        {
          team2Players: updateTeamScore(prevState[1].team2Players, playerIndex, runs),
          name: 'Team 2',
          index: 1
        }
      ];
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
