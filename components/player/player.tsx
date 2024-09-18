import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import Image from 'next/image';

type PlayerProps = {
  index: number;
  runs: number;
  wicketsTaken: number;
  currentStriker: boolean;
  allActions: (string | null)[];
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
  const [name, setName] = useState('Player ' + (index + 1));
  const [editPlayer, setEditPlayer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEditPlayerName = () => {
    setEditPlayer(true);
  };

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSavePlayerName = () => {
    setEditPlayer(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
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
              <Image alt="" title="Edit player" width={16} height={16} src="/icons/png/edit.png" />
            </StyledButton>
          </>
        )}
        {editPlayer && (
          <>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={handlePlayerNameChange}
              onKeyDown={handleKeyDown}
            />
            <StyledButton onClick={handleSavePlayerName} aria-label="Save player">
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
      <p>Wickets Taken: {wicketsTaken}</p>
      <p>Overs Bowled: {oversBowled}</p>
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
  min-width: 250px;
  justify-content: center;
`;

const StyledButton = styled.button`
  background-color: white;
  border: none;
  cursor: pointer;
`;
