import React, { useState } from 'react';
import styled from '@emotion/styled';

type PlayerProps = {
  index: number;
  runs: number;
  currentStriker: boolean;
  allActions: (string | null)[];
  currentNonStriker: boolean;
  status: string;
};

export const Player = ({
  index,
  runs,
  currentStriker,
  allActions,
  currentNonStriker,
  status
}: PlayerProps) => {
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
      {currentStriker && (
        <img alt="" title="Current striker" width="32px" src="/icons/png/004-cricket-player.png" />
      )}
      {currentNonStriker && (
        <img alt="" title="Current non striker" width="32px" src="/icons/png/010-helmet.png" />
      )}
      <p>{status}</p>
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
