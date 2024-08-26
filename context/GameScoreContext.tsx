import React, { createContext, useContext, useState } from 'react';
import defaultPlayers from '../components/core/players';

type TeamPlayer = {
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
};

export type GameScore = [
  {
    players: TeamPlayer[];
    name: 'Team 1';
    index: 0;
    totalRuns: number;
    totalWicketsConceded: number;
    totalWicketsTaken: number;
    overs: number;
    currentBattingTeam: boolean;
    currentBowlingTeam: boolean;
    finishedBatting: boolean;
  },
  {
    players: TeamPlayer[];
    name: 'Team 2';
    index: 1;
    totalRuns: number;
    totalWicketsConceded: number;
    totalWicketsTaken: number;
    overs: number;
    currentBattingTeam: boolean;
    currentBowlingTeam: boolean;
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
  setBattingPlayerScore: (
    teamIndex: number,
    playerIndex: number,
    runs: number,
    action: string | null,
    endOfOver: boolean,
    endOfInnings: boolean,
    methodOfWicket: 'LBW' | 'Caught' | 'Run Out' | null
  ) => void;
  setBowlingPlayerScore: (teamIndex: number, playerIndex: number, action: string | null) => void;
  swapBatsmen: (currentStriker: TeamPlayer, currentNonStriker: TeamPlayer) => void;
  setCurrentBowler: (teamIndex: number, playerIndex: number) => void;
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
      totalWicketsConceded: 0,
      totalWicketsTaken: 0,
      overs: 0,
      currentBattingTeam: true,
      currentBowlingTeam: false,
      finishedBatting: false
    },
    {
      players: [],
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
  ],
  setGameScore: (gameScore) => {
    // eslint-disable-next-line no-console
    console.log('Initial setGameScore called with', gameScore);
  },
  setBattingPlayerScore: (playerScore) => {
    // eslint-disable-next-line no-console
    console.log('Initial setBattingPlayerScore called with', playerScore);
  },
  setBowlingPlayerScore: (playerScore) => {
    // eslint-disable-next-line no-console
    console.log('Initial setBowlingPlayerScore called with', playerScore);
  },
  swapBatsmen: () => {
    // eslint-disable-next-line no-console
    console.log('Initial swapBatsmen called');
  },
  setCurrentBowler: () => {
    // eslint-disable-next-line no-console
    console.log('Initial setCurrentBowler called');
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
  ]);

  const currentBattingTeam = gameScore.find((team) => team.currentBattingTeam);
  if (!currentBattingTeam) {
    return;
  }
  const currentBattingTeamIndex = currentBattingTeam.index;

  if (!gameScore[currentBattingTeamIndex].players.find((player) => player.currentStriker)) {
    gameScore[currentBattingTeamIndex].players[0].currentStriker = true;
  }

  const updateTeamScoreForBatting = (
    teamPlayers: TeamPlayer[],
    playerIndex: number,
    runs: number,
    action: string | null,
    endOfOver: boolean,
    methodOfWicket: 'LBW' | 'Caught' | 'Run Out' | null
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

    console.log(31, updatedTeamPlayers);

    if (action === 'Wicket') {
      updatedTeamPlayers[playerIndex].status = 'Out';
      updatedTeamPlayers[playerIndex].onTheCrease = false;
      updatedTeamPlayers[playerIndex].currentStriker = false;
      updatedTeamPlayers[playerIndex].currentNonStriker = false;
      updatedTeamPlayers[playerIndex].methodOfWicket = methodOfWicket;

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
      if (!currentStriker || !currentNonStriker) {
        return updatedTeamPlayers;
      }
      swapBatsmen(currentStriker, currentNonStriker);
    }

    console.log(35, updatedTeamPlayers);

    return updatedTeamPlayers;
  };

  const updateTeamScoreForBowling = (
    teamPlayers: TeamPlayer[],
    playerIndex: number,
    action: string | null
  ) => {
    const player = teamPlayers.find((player) => player.index === playerIndex);

    if (!player) {
      return teamPlayers;
    }

    return teamPlayers.map((player) =>
      player.index === playerIndex
        ? {
            ...player,
            wicketsTaken: player.wicketsTaken + (action === 'Wicket' ? 1 : 0),
            allActions: [...player.allActions, action || '']
          }
        : player
    );
  };

  const setBattingPlayerScore = (
    teamIndex: number,
    playerIndex: number,
    runs: number,
    action: string | null,
    endOfOver: boolean,
    endOfInnings: boolean,
    methodOfWicket: 'LBW' | 'Caught' | 'Run Out' | null
  ) => {
    if (teamIndex < 0 || teamIndex > 1) {
      return;
    }
    setGameScoreState((prevState: GameScore) => {
      console.log(32, prevState);
      return [
        {
          players:
            teamIndex === 0
              ? updateTeamScoreForBatting(
                  prevState[0].players,
                  playerIndex,
                  runs,
                  action,
                  endOfOver,
                  methodOfWicket
                )
              : prevState[0].players,
          name: 'Team 1',
          index: 0,
          totalRuns: teamIndex === 0 ? prevState[0].totalRuns + runs : prevState[0].totalRuns,
          totalWicketsConceded:
            teamIndex === 0
              ? prevState[0].totalWicketsConceded + (action === 'Wicket' ? 1 : 0)
              : prevState[0].totalWicketsConceded,
          totalWicketsTaken: prevState[0].totalWicketsTaken,
          overs: teamIndex === 0 && endOfOver ? prevState[0].overs + 1 : prevState[0].overs,
          currentBattingTeam: !endOfInnings
            ? prevState[0].currentBattingTeam
            : !prevState[0].currentBattingTeam,
          currentBowlingTeam: prevState[0].currentBowlingTeam,
          finishedBatting: prevState[0].finishedBatting || (teamIndex === 0 && endOfInnings)
        },
        {
          players:
            teamIndex === 1
              ? updateTeamScoreForBatting(
                  prevState[1].players,
                  playerIndex,
                  runs,
                  action,
                  endOfOver,
                  methodOfWicket
                )
              : prevState[1].players,
          name: 'Team 2',
          index: 1,
          totalRuns: teamIndex === 1 ? prevState[1].totalRuns + runs : prevState[1].totalRuns,
          totalWicketsConceded:
            teamIndex === 1
              ? prevState[1].totalWicketsConceded + (action === 'Wicket' ? 1 : 0)
              : prevState[1].totalWicketsConceded,
          totalWicketsTaken: prevState[1].totalWicketsTaken,
          overs: teamIndex === 1 && endOfOver ? prevState[1].overs + 1 : prevState[1].overs,
          currentBattingTeam: !endOfInnings
            ? prevState[1].currentBattingTeam
            : !prevState[1].currentBattingTeam,
          currentBowlingTeam: prevState[1].currentBowlingTeam,
          finishedBatting: prevState[1].finishedBatting || (teamIndex === 1 && endOfInnings)
        }
      ];
    });
  };

  const setBowlingPlayerScore = (teamIndex: number, playerIndex: number, action: string | null) => {
    if (teamIndex < 0 || teamIndex > 1) {
      return;
    }
    setGameScoreState((prevState: GameScore) => {
      return [
        {
          ...prevState[0],
          players:
            teamIndex === 0
              ? prevState[0].players
              : updateTeamScoreForBowling(prevState[0].players, playerIndex, action),
          totalWicketsTaken:
            teamIndex === 1
              ? prevState[0].totalWicketsTaken + (action === 'Wicket' ? 1 : 0)
              : prevState[0].totalWicketsTaken
        },
        {
          ...prevState[1],
          players:
            teamIndex === 1
              ? updateTeamScoreForBowling(prevState[1].players, playerIndex, action)
              : prevState[1].players,
          totalWicketsTaken:
            teamIndex === 0
              ? prevState[1].totalWicketsTaken + (action === 'Wicket' ? 1 : 0)
              : prevState[1].totalWicketsTaken
        }
      ];
    });
  };

  const setGameScore = (gameScore: GameScore) => {
    setGameScoreState(gameScore);
  };

  const swapBatsmen = (currentStriker: TeamPlayer, currentNonStriker: TeamPlayer) => {
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
          totalWicketsConceded: prevState[0].totalWicketsConceded,
          totalWicketsTaken: prevState[0].totalWicketsTaken,
          overs: prevState[0].overs,
          currentBattingTeam: prevState[0].currentBattingTeam,
          currentBowlingTeam: prevState[0].currentBowlingTeam,
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
          totalWicketsConceded: prevState[1].totalWicketsConceded,
          totalWicketsTaken: prevState[0].totalWicketsTaken,
          overs: prevState[1].overs,
          currentBattingTeam: prevState[1].currentBattingTeam,
          currentBowlingTeam: prevState[1].currentBowlingTeam,
          finishedBatting: prevState[1].finishedBatting
        }
      ];
    });
  };

  const setCurrentBowler = (teamIndex: number, playerIndex: number) => {
    // update the current bowler
    setGameScoreState((prevState: GameScore) => {
      return [
        teamIndex === 0
          ? {
              ...prevState[0],
              players: prevState[0].players.map((player) =>
                player.index === playerIndex
                  ? { ...player, currentBowler: true }
                  : { ...player, currentBowler: false }
              )
            }
          : prevState[0],
        teamIndex === 1
          ? {
              ...prevState[1],
              players: prevState[1].players.map((player) =>
                player.index === playerIndex
                  ? { ...player, currentBowler: true }
                  : { ...player, currentBowler: false }
              )
            }
          : prevState[1]
      ];
    });
  };

  return (
    <GameScoreContext.Provider
      value={{
        gameScore,
        setGameScore,
        setBattingPlayerScore,
        setBowlingPlayerScore,
        swapBatsmen,
        setCurrentBowler
      }}>
      {children}
    </GameScoreContext.Provider>
  );
};
