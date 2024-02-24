import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Player } from '../player/player';
import { useGameScore } from '../../context/GameScoreContext';

type Player = {
  name: string;
  index: number;
  runs: number;
  isBatting: boolean;
  allActions: (string | null)[];
};

type TeamProps = {
  teamIndex: number;
  name: string;
  players: Player[];
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
  index: number;
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
  currentStriker,
  currentNonStriker,
  mostRecentAction
}: TeamProps) => {
  const [teamName, setTeamName] = useState('Team ' + teamIndex);
  const [editTeamName, setEditTeamName] = useState(false);

  const handleEditTeamName = () => {
    setEditTeamName(true);
  };

  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamName(e.target.value);
  };

  const handleSaveTeamName = () => {
    setEditTeamName(false);
  };

  const { gameScore } = useGameScore();
  // now replace players

  return (
    <TeamContainer>
      {!editTeamName && (
        <>
          <p>{teamName}</p>
          <button onClick={() => handleEditTeamName()}>Edit Team Name</button>
        </>
      )}
      {editTeamName && (
        <>
          <input
            type="text"
            aria-label="Edit team name"
            value={teamName}
            onChange={(event) => handleTeamNameChange(event)}
          />
          <button onClick={() => handleSaveTeamName()}>Save Team Name</button>
        </>
      )}
      <TeamLayout>
        <div>
          {players.map((player, index) => {
            return (
              <Player key={index} index={index} runs={player.runs} isBatting={player.isBatting} />
            );
          })}
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
