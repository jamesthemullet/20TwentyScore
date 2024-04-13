import React, { createContext, useContext, useState } from 'react';
import defaultPlayers from '../components/core/players';

type TeamPlayer = {
  index: number;
  name: string;
  runs: number;
  currentStriker: boolean;
  allActions: (string | null)[];
  currentNonStriker: boolean;
  onTheCrease: boolean;
  status: string;
};

export type GameScore = [
  {
    players: TeamPlayer[];
    name: 'Team 1';
    index: 0;
    totalRuns: number;
    totalWickets: number;
    overs: number;
  },
  {
    players: TeamPlayer[];
    name: 'Team 2';
    index: 1;
    totalRuns: number;
    totalWickets: number;
    overs: number;
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
  swapBatsmen: () => void;
};

type GameScoreProviderProps = {
  children: React.ReactNode;
};

export const GameScoreContext = createContext<GameScoreContextType>({
  gameScore: [
    {
      players: [],
      name: 'Team 1',
      index: 0,
      totalRuns: 0,
      totalWickets: 0,
      overs: 0
    },
    {
      players: [],
      name: 'Team 2',
      index: 1,
      totalRuns: 0,
      totalWickets: 0,
      overs: 0
    }
  ],
  setGameScore: (gameScore) => {
    console.log('Initial setGameScore called with', gameScore);
  },
  setPlayerScore: (playerScore) => {
    console.log('Initial setPlayerScore called with', playerScore);
  },
  swapBatsmen: () => {
    console.log('Initial swapBatsmen called');
  }
});

export const useGameScore = () => useContext(GameScoreContext);

export const GameScoreProvider: React.FC<GameScoreProviderProps> = ({ children }) => {
  const [gameScore, setGameScoreState] = useState<GameScore>([
    {
      players: defaultPlayers(),
      name: 'Team 1',
      index: 0,
      totalRuns: 0,
      totalWickets: 0,
      overs: 0
    },
    {
      players: defaultPlayers(),
      name: 'Team 2',
      index: 1,
      totalRuns: 0,
      totalWickets: 0,
      overs: 0
    }
  ]);

  if (!gameScore[0].players.find((player) => player.currentStriker)) {
    gameScore[0].players[0].currentStriker = true;
  }

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

    if (action === 'Wicket') {
      updatedTeamPlayers[playerIndex].status = 'Out';
      updatedTeamPlayers[playerIndex].onTheCrease = false;
      updatedTeamPlayers[playerIndex].currentStriker = false;

      const nextPlayer = updatedTeamPlayers.find(
        (player) => player.status !== 'Out' && !player.onTheCrease
      );

      if (nextPlayer) {
        updatedTeamPlayers[nextPlayer.index].onTheCrease = true;
        updatedTeamPlayers[nextPlayer.index].currentStriker = true;
      }
    }

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
          index: 0,
          totalRuns: prevState[0].totalRuns + runs,
          totalWickets: prevState[0].totalWickets + (action === 'Wicket' ? 1 : 0),
          overs: prevState[0].overs
        },
        {
          players: updateTeamScore(prevState[1].players, playerIndex, runs, action),
          name: 'Team 2',
          index: 1,
          totalRuns: prevState[1].totalRuns + runs,
          totalWickets: prevState[1].totalWickets + (action === 'Wicket' ? 1 : 0),
          overs: prevState[1].overs
        }
      ];
    });
  };

  const setGameScore = (gameScore: GameScore) => {
    setGameScoreState(gameScore);
  };

  const swapBatsmen = () => {
    const currentStriker = gameScore[0].players.find((player) => player.currentStriker);
    const currentNonStriker = gameScore[0].players.find((player) => player.currentNonStriker);

    setGameScoreState((prevState: GameScore) => {
      return [
        {
          players: prevState[0].players.map((player) =>
            player.index === currentStriker?.index
              ? { ...player, currentStriker: false, currentNonStriker: true }
              : player.index === currentNonStriker?.index
              ? { ...player, currentStriker: true, currentNonStriker: false }
              : player
          ),
          name: 'Team 1',
          index: 0,
          totalRuns: prevState[0].totalRuns,
          totalWickets: prevState[0].totalWickets,
          overs: prevState[0].overs
        },
        {
          players: prevState[1].players,
          name: 'Team 2',
          index: 1,
          totalRuns: prevState[1].totalRuns,
          totalWickets: prevState[1].totalWickets,
          overs: prevState[1].overs
        }
      ];
    });
  };

  return (
    <GameScoreContext.Provider value={{ gameScore, setGameScore, setPlayerScore, swapBatsmen }}>
      {children}
    </GameScoreContext.Provider>
  );
};
