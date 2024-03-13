import React, { createContext, useContext, useState } from 'react';
import defaultPlayers from '../components/core/players';

type TeamPlayer = {
  index: number;
  name: string;
  runs: number;
  currentStriker: boolean;
  allActions: (string | null)[];
  currentNonStriker: boolean;
};

export type GameScore = [
  {
    players: TeamPlayer[];
    name: 'Team 1';
    index: 0;
  },
  {
    players: TeamPlayer[];
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
  setPlayerScore: (
    teamIndex: number,
    playerIndex: number,
    runs: number,
    action: string | null
  ) => void;
};

type GameScoreProviderProps = {
  children: React.ReactNode;
};

export const GameScoreContext = createContext<GameScoreContextType>({
  gameScore: [
    {
      players: [],
      name: 'Team 1',
      index: 0
    },
    {
      players: [],
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
      players: defaultPlayers(),
      name: 'Team 1',
      index: 0
    },
    {
      players: defaultPlayers(),
      name: 'Team 2',
      index: 1
    }
  ]);

  const updateTeamScore = (
    teamPlayers: TeamPlayer[],
    playerIndex: number,
    runs: number,
    action: string | null
  ) => {
    const player = teamPlayers.find((player) => player.index === playerIndex);

    if (!player) {
      return teamPlayers;
    }

    const updatedTeamPlayers = teamPlayers.map((player) =>
      player.index === playerIndex
        ? {
            ...player,
            runs: player.runs + runs,
            allActions: [...player.allActions, action || runs.toString()]
          }
        : player
    );

    return updatedTeamPlayers;
  };

  const setPlayerScore = (
    teamIndex: number,
    playerIndex: number,
    runs: number,
    action: string | null
  ) => {
    if (teamIndex < 0 || teamIndex > 1) {
      return;
    }
    setGameScoreState((prevState: GameScore) => {
      return [
        {
          players: updateTeamScore(prevState[0].players, playerIndex, runs, action),
          name: 'Team 1',
          index: 0
        },
        {
          players: updateTeamScore(prevState[1].players, playerIndex, runs, action),
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
