import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

type Player = {
  name: string;
  runs: number;
  isBatting: boolean;
  allActions: string[];
};

type TeamProps = {
  teamIndex: number;
  name: string;
  players: Player[];
  onSetPlayers: (teamIndex: number, playerIndex: number, event: string) => void;
};

const Team = ({ teamIndex, name, players, onSetPlayers }: TeamProps) => {
  const [teamName, setTeamName] = useState(name);
  const [editTeamName, setEditTeamName] = useState(false);
  const [editPlayerIndex, setEditPlayerIndex] = useState(-1);
  const teamNameInputRef = useRef<HTMLInputElement>(null);
  const playerInputsRef = useRef<HTMLInputElement[]>([]);

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

  const handlePlayerNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    playerIndex: number
  ) => {
    onSetPlayers(teamIndex, playerIndex, event.target.value);
  };

  const handleEditTeamName = () => {
    setEditTeamName(true);
  };

  const handleSaveTeamName = () => {
    setEditTeamName(false);
  };

  const handleEditPlayerName = (playerIndex: number) => {
    setEditPlayerIndex(playerIndex);
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
            <PlayerItem key={index}>
              {editPlayerIndex === index ? (
                <>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(event) => handlePlayerNameChange(event, index)}
                    ref={(input) => {
                      if (input) {
                        playerInputsRef.current[index] = input;
                      }
                    }}
                  />
                  <button onClick={handleSavePlayerName}>Save</button>
                </>
              ) : (
                <>
                  <p>{player.name}</p>
                  <button onClick={() => handleEditPlayerName(index)}>Edit</button>
                </>
              )}
              <p>Runs: {player.runs}</p>
              {player.isBatting && (
                <img alt="logo" width="32px" src="/icons/png/006-cricket-1.png" />
              )}
              {player.allActions.length > 0 && <p>{player.allActions.join(', ')}</p>}
            </PlayerItem>
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
  width: 30%;
  border: 1px solid black;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
`;

const TeamLayout = styled.div`
  display: flex;
  flex-direction: column;
`;

const PlayerItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
  border-bottom: 1px solid #ccc;
`;
