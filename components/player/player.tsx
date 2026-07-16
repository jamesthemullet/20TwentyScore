import styled from '@emotion/styled';
import Image from 'next/image';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

type PlayerProps = {
  index: number;
  runs: number;
  wicketsTaken: number;
  currentStriker: boolean;
  currentNonStriker: boolean;
  status: string;
  oversBowled: number;
};

export const Player = ({
  index,
  runs,
  wicketsTaken,
  currentStriker,
  currentNonStriker,
  status,
  oversBowled
}: PlayerProps) => {
  const [name, setName] = useState(`Player ${index + 1}`);
  const [editPlayer, setEditPlayer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEditPlayerName = (): void => {
    setEditPlayer(true);
  };

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleSavePlayerName = (): void => {
    setEditPlayer(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      handleSavePlayerName();
    }
    if (event.key === 'Escape') {
      setEditPlayer(false);
    }
  };

  useEffect(() => {
    if (editPlayer && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editPlayer]);

  return (
    <PlayerContainer>
      <PlayerName>
        {!editPlayer && (
          <>
            <p>{name}</p>
            <StyledButton onClick={handleEditPlayerName} aria-label="Edit player">
              <Image alt="" width={16} height={16} src="/icons/png/edit.png" />
            </StyledButton>
          </>
        )}
        {editPlayer && (
          <>
            <input
              ref={inputRef}
              type="text"
              value={name}
              aria-label={`Edit name for ${name}`}
              onChange={handlePlayerNameChange}
              onKeyDown={handleKeyDown}
            />
            <StyledButton onClick={handleSavePlayerName} aria-label="Save player">
              <Image
                alt=""
                width={16}
                height={16}
                src="/icons/png/009-save.png"
              />
            </StyledButton>
          </>
        )}
      </PlayerName>
      <p>Runs: {runs}</p>
      <p>Wickets Taken: {wicketsTaken}</p>
      <p>Overs Bowled: {oversBowled}</p>
      {currentStriker && (
        <Image
          alt="Current striker"
          width={32}
          height={32}
          src="/icons/png/004-cricket-player.png"
        />
      )}
      {currentNonStriker && (
        <Image
          alt="Current non-striker"
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
  min-width: 250px;
  justify-content: center;
`;

const StyledButton = styled.button`
  background-color: white;
  border: none;
  cursor: pointer;
`;
