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
    currentBattingTeam: boolean;
    finishedBatting: boolean;
  },
  {
    players: TeamPlayer[];
    name: 'Team 2';
    index: 1;
    totalRuns: number;
    totalWickets: number;
    overs: number;
    currentBattingTeam: boolean;
    finishedBatting: boolean;
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
    action: string | null,
    endOfOver: boolean,
    endOfInnings: boolean
  ) => void;
  swapBatsmen: (currentStriker: TeamPlayer, currentNonStriker: TeamPlayer) => void;
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
      overs: 0,
      currentBattingTeam: true,
      finishedBatting: false
    },
    {
      players: [],
      name: 'Team 2',
      index: 1,
      totalRuns: 0,
      totalWickets: 0,
      overs: 0,
      currentBattingTeam: false,
      finishedBatting: false
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
      overs: 0,
      currentBattingTeam: true,
      finishedBatting: false
    },
    {
      players: defaultPlayers(),
      name: 'Team 2',
      index: 1,
      totalRuns: 0,
      totalWickets: 0,
      overs: 0,
      currentBattingTeam: false,
      finishedBatting: false
    }
  ]);

  console.log(16, gameScore[0].players);

  const currentBattingTeam = gameScore.find((team) => team.currentBattingTeam);
  if (!currentBattingTeam) {
    return;
  }
  const currentBattingTeamIndex = currentBattingTeam.index;

  if (!gameScore[currentBattingTeamIndex].players.find((player) => player.currentStriker)) {
    gameScore[currentBattingTeamIndex].players[0].currentStriker = true;
  }

  const updateTeamScore = (
    teamPlayers: TeamPlayer[],
    playerIndex: number,
    runs: number,
    action: string | null,
    endOfOver: boolean
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

    console.log(10, runs % 2);

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

      const currentStriker = updatedTeamPlayers.find((player) => player.currentStriker);
      const currentNonStriker = updatedTeamPlayers.find((player) => player.currentNonStriker);

      if (!currentStriker || !currentNonStriker) {
        return updatedTeamPlayers;
      }

      if (endOfOver) {
        swapBatsmen(currentStriker, currentNonStriker);
      }
    } else if (runs % 2 !== 0) {
      const currentStriker = updatedTeamPlayers.find((player) => player.currentStriker);
      const currentNonStriker = updatedTeamPlayers.find((player) => player.currentNonStriker);
      console.log(12, currentStriker, currentNonStriker);
      if (!currentStriker || !currentNonStriker) {
        return updatedTeamPlayers;
      }
      swapBatsmen(currentStriker, currentNonStriker);
    }

    return updatedTeamPlayers;
  };

  const setPlayerScore = (
    teamIndex: number,
    playerIndex: number,
    runs: number,
    action: string | null,
    endOfOver: boolean,
    endOfInnings: boolean
  ) => {
    if (teamIndex < 0 || teamIndex > 1) {
      return;
    }
    setGameScoreState((prevState: GameScore) => {
      return [
        {
          players:
            teamIndex === 0
              ? updateTeamScore(prevState[0].players, playerIndex, runs, action, endOfOver)
              : prevState[0].players,
          name: 'Team 1',
          index: 0,
          totalRuns: teamIndex === 0 ? prevState[0].totalRuns + runs : prevState[0].totalRuns,
          totalWickets:
            teamIndex === 0
              ? prevState[0].totalWickets + (action === 'Wicket' ? 1 : 0)
              : prevState[0].totalWickets,
          overs: teamIndex === 0 && endOfOver ? prevState[0].overs + 1 : prevState[0].overs,
          currentBattingTeam: !endOfInnings
            ? prevState[0].currentBattingTeam
            : !prevState[0].currentBattingTeam,
          finishedBatting: prevState[0].finishedBatting || (teamIndex === 0 && endOfInnings)
        },
        {
          players:
            teamIndex === 1
              ? updateTeamScore(prevState[1].players, playerIndex, runs, action, endOfOver)
              : prevState[1].players,
          name: 'Team 2',
          index: 1,
          totalRuns: teamIndex === 1 ? prevState[1].totalRuns + runs : prevState[1].totalRuns,
          totalWickets:
            teamIndex === 1
              ? prevState[1].totalWickets + (action === 'Wicket' ? 1 : 0)
              : prevState[1].totalWickets,
          overs: teamIndex === 1 && endOfOver ? prevState[1].overs + 1 : prevState[1].overs,
          currentBattingTeam: !endOfInnings
            ? prevState[1].currentBattingTeam
            : !prevState[1].currentBattingTeam,
          finishedBatting: prevState[1].finishedBatting || (teamIndex === 1 && endOfInnings)
        }
      ];
    });
  };

  const setGameScore = (gameScore: GameScore) => {
    setGameScoreState(gameScore);
  };

  const swapBatsmen = (currentStriker: TeamPlayer, currentNonStriker: TeamPlayer) => {
    console.log(14, currentStriker, currentNonStriker);
    setGameScoreState((prevState: GameScore) => {
      console.log(15, prevState[0].players[0]);
      console.log(15.5, [
        {
          players: prevState[0].players.map((player) =>
            player.index === currentStriker?.index
              ? { ...player, currentStriker: false, currentNonStriker: true }
              : player.index === currentNonStriker?.index
              ? { ...player, currentStriker: true, currentNonStriker: false }
              : player
          )[0]
        }
      ]);
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
          overs: prevState[0].overs,
          currentBattingTeam: prevState[0].currentBattingTeam,
          finishedBatting: prevState[0].finishedBatting
        },
        {
          players: prevState[1].players.map((player) =>
            player.index === currentStriker?.index
              ? { ...player, currentStriker: false, currentNonStriker: true }
              : player.index === currentNonStriker?.index
              ? { ...player, currentStriker: true, currentNonStriker: false }
              : player
          ),
          name: 'Team 2',
          index: 1,
          totalRuns: prevState[1].totalRuns,
          totalWickets: prevState[1].totalWickets,
          overs: prevState[1].overs,
          currentBattingTeam: prevState[1].currentBattingTeam,
          finishedBatting: prevState[1].finishedBatting
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
