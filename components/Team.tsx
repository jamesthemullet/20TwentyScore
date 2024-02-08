import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { Player } from './player/player';

type Player = {
  name: string;
  runs: number;
  isBatting: boolean;
  allActions: (string | null)[];
};

type TeamProps = {
  teamIndex: number;
  name: string;
  players: Player[];
  teamScore: {
    runs: number;
    wickets: number;
    balls: number;
    extras: number;
  };
  currentStriker: {
    index: number;
    isBatting: boolean;
  };
  currentNonStriker: {
    index: number;
    isBatting: boolean;
  };
  mostRecentAction: { runs: number; action: null | string };
};

type TeamPlayer = {
  runs: number;
  isBatting: boolean;
  allActions: (string | null)[];
};

type RecentAction = {
  runs: number;
  action: string | null;
};

type PlayersScore = {
  player1: TeamPlayer;
  player2: TeamPlayer;
  player3: TeamPlayer;
  player4: TeamPlayer;
  player5: TeamPlayer;
  player6: TeamPlayer;
  player7: TeamPlayer;
  player8: TeamPlayer;
  player9: TeamPlayer;
  player10: TeamPlayer;
  player11: TeamPlayer;
};

const Team = ({
  teamIndex,
  name,
  players,
  teamScore,
  currentStriker,
  currentNonStriker,
  mostRecentAction
}: TeamProps) => {
  const [teamName, setTeamName] = useState(name);
  const [editTeamName, setEditTeamName] = useState(false);
  const [editPlayerIndex, setEditPlayerIndex] = useState(-1);
  const teamNameInputRef = useRef<HTMLInputElement>(null);
  const playerInputsRef = useRef<HTMLInputElement[]>([]);
  const initialPlayerState = {
    runs: 0,
    isBatting: false,
    allActions: []
  };
  const [playersScore, setPlayersScore] = useState<PlayersScore>({
    player1: { ...initialPlayerState },
    player2: { ...initialPlayerState },
    player3: { ...initialPlayerState },
    player4: { ...initialPlayerState },
    player5: { ...initialPlayerState },
    player6: { ...initialPlayerState },
    player7: { ...initialPlayerState },
    player8: { ...initialPlayerState },
    player9: { ...initialPlayerState },
    player10: { ...initialPlayerState },
    player11: { ...initialPlayerState }
  });

  const updatePlayerScore = (teamPlayers: TeamPlayer, mostRecentAction: RecentAction) => {
    return {
      ...teamPlayers,
      runs: teamPlayers.runs + mostRecentAction.runs,
      isBatting: currentStriker.isBatting,
      allActions: [...teamPlayers.allActions, mostRecentAction.action]
    };
  };

  useEffect(() => {
    setPlayersScore((prevState: PlayersScore) => {
      const updatedPlayers = { ...prevState };

      updatedPlayers[`player${currentStriker.index + 1}` as keyof typeof playersScore] =
        updatePlayerScore(
          prevState[`player${currentStriker.index + 1}` as keyof typeof playersScore],
          mostRecentAction
        );

      return updatedPlayers;
    });
  }, [teamScore]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (teamNameInputRef.current && !teamNameInputRef.current.contains(event.target as Node)) {
        handleSaveTeamName();
      }
      if (
        editPlayerIndex >= 0 &&
        playerInputsRef.current[editPlayerIndex] &&
        !playerInputsRef.current[editPlayerIndex].contains(event.target as Node)
      ) {
        handleSavePlayerName();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editPlayerIndex]);

  const handleTeamNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTeamName(event.target.value);
  };

  const handleEditTeamName = () => {
    setEditTeamName(true);
  };

  const handleSaveTeamName = () => {
    setEditTeamName(false);
  };

  const handleSavePlayerName = () => {
    setEditPlayerIndex(-1);
  };

  return (
    <TeamContainer>
      {editTeamName ? (
        <>
          <input
            type="text"
            value={teamName}
            onChange={handleTeamNameChange}
            ref={teamNameInputRef}
          />
          <button onClick={handleSaveTeamName}>Save</button>
        </>
      ) : (
        <>
          <h2>{teamName}</h2>
          <button onClick={handleEditTeamName}>Edit</button>
        </>
      )}
      <TeamLayout>
        <div>
          {players.map((player, index) => (
            <Player
              key={index}
              index={index}
              runs={playersScore[`player${index + 1}` as keyof typeof playersScore].runs}
              isBatting={playersScore[`player${index + 1}` as keyof typeof playersScore].isBatting}
            />
          ))}
        </div>
      </TeamLayout>
    </TeamContainer>
  );
};

export default Team;

const TeamContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid black;
  border-radius: 5px;
  padding: 20px;
  flex: 5;
  background-color: #f4f4f4;
`;

const TeamLayout = styled.div`
  display: flex;
  flex-direction: column;

  input[type='text'] {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
  }

  button {
    padding: 8px 12px;
    background-color: black;
    color: #fff;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }
`;
