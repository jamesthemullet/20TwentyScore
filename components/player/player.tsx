import React, { useState } from 'react';
import styled from '@emotion/styled';

type PlayerProps = {
  index: number;
  runs: number;
  isBatting: boolean;
};

export const Player = ({ index, runs, isBatting }: PlayerProps) => {
  const [name, setName] = useState('Player ' + index);
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
            <button onClick={() => handleEditPlayerName()}>Edit</button>
          </>
        )}
        {editPlayer && (
          <>
            <input type="text" value={name} onChange={(event) => handlePlayerNameChange(event)} />
            <button onClick={() => handleSavePlayerName()}>Save</button>
          </>
        )}
      </PlayerName>
      <p>Runs: {runs}</p>
      {/* {isBatting && <img alt="logo" width="32px" src="/icons/png/006-cricket-1.png" />} */}
      {/* {allActions.length > 0 && <p>{allActions.join(', ')}</p>} */}
    </PlayerContainer>
  );
};

const PlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid black;
  border-radius: 5px;
  margin: 10px;
  width: 100%;
  box-sizing: border-box;
`;

const PlayerName = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 20px;
`;
