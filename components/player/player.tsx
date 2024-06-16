import React, { useState } from 'react';
import styled from '@emotion/styled';
import { SecondaryButton } from '../core/buttons';
import Image from 'next/image';

type PlayerProps = {
  index: number;
  runs: number;
  currentStriker: boolean;
  allActions: (string | null)[];
  currentNonStriker: boolean;
  status: string;
};

export const Player = ({ index, runs, currentStriker, currentNonStriker, status }: PlayerProps) => {
  const [name, setName] = useState('Player ' + (index + 1));
  const [editPlayer, setEditPlayer] = useState(false);

  const handleEditPlayerName = () => {
    setEditPlayer(true);
  };

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSavePlayerName = () => {
    setEditPlayer(false);
  };

  return (
    <PlayerContainer>
      <PlayerName>
        {!editPlayer && (
          <>
            <p>{name}</p>
            <StyledButton onClick={() => handleEditPlayerName()} aria-label="Edit player">
              <Image alt="" title="Edit player" width={16} height={16} src="/icons/png/edit.png" />
            </StyledButton>
          </>
        )}
        {editPlayer && (
          <>
            <input type="text" value={name} onChange={(event) => handlePlayerNameChange(event)} />
            <StyledButton onClick={() => handleSavePlayerName()} aria-label="Save player">
              <Image
                alt=""
                title="Save player"
                width={16}
                height={16}
                src="/icons/png/009-save.png"
              />
            </StyledButton>
          </>
        )}
      </PlayerName>
      <p>Runs: {runs}</p>
      {currentStriker && (
        <Image
          alt=""
          title="Current striker"
          width={32}
          height={32}
          src="/icons/png/004-cricket-player.png"
        />
      )}
      {currentNonStriker && (
        <Image
          alt=""
          title="Current non striker"
          width={32}
          height={32}
          src="/icons/png/010-helmet.png"
        />
      )}
      <p>{status}</p>
    </PlayerContainer>
  );
};

const PlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 3px solid black;
  margin: 10px;
  box-sizing: border-box;
`;

const PlayerName = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 20px;
`;

const StyledButton = styled.button`
  background-color: white;
  border: none;
  cursor: pointer;
`;
