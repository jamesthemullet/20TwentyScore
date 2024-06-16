import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Player } from '../player/player';
import { useGameScore } from '../../context/GameScoreContext';
import { HomeContainer } from '../core/home-container';
import { StyledHeading2 } from '../core/heading';
import { PrimaryButton, SecondaryButton } from '../core/buttons';

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
    <HomeContainer>
      {!editTeamName && (
        <>
          <StyledHeading2>{teamName}</StyledHeading2>
          <SecondaryButton onClick={() => handleEditTeamName()}>Edit Team Name</SecondaryButton>
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
          <SecondaryButton onClick={() => handleSaveTeamName()}>Save Team Name</SecondaryButton>
        </>
      )}
      <TeamLayout>
        {gameScore[teamIndex]?.players.map((player, index) => {
          return (
            <Player
              key={index}
              index={index}
              runs={player.runs}
              currentStriker={player.currentStriker && currentBattingTeamIndex === teamIndex}
              allActions={player.allActions}
              currentNonStriker={player.currentNonStriker && currentBattingTeamIndex === teamIndex}
              status={player.status}
            />
          );
        })}
      </TeamLayout>
    </HomeContainer>
  );
};

export default Team;

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
    color: #fff;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }
`;
