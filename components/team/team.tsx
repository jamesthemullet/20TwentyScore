import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Player } from '../player/player';
import { useGameScore } from '../../context/GameScoreContext';

type Player = {
  name: string;
  index: number;
  runs: number;
  currentStriker: boolean;
  allActions: (string | null)[];
};

type TeamProps = {
  teamIndex: number;
};

const Team = ({ teamIndex }: TeamProps) => {
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

  const currentBattingTeam = gameScore.find((team) => team.currentBattingTeam);
  if (!currentBattingTeam) {
    return null;
  }
  const currentBattingTeamIndex = currentBattingTeam.index;

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
          {gameScore[teamIndex]?.players.map((player, index) => {
            return (
              <Player
                key={index}
                index={index}
                runs={player.runs}
                currentStriker={player.currentStriker && currentBattingTeamIndex === teamIndex}
                allActions={player.allActions}
                currentNonStriker={
                  player.currentNonStriker && currentBattingTeamIndex === teamIndex
                }
                status={player.status}
              />
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
