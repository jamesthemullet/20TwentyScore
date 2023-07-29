import React from 'react';
import styled from 'styled-components';

type Player = {
  name: string;
  runs: number;
  isBatting: boolean;
  allActions: string[];
};

type TeamProps = {
  name: string;
  players: Player[];
};

const Team = ({ name, players }: TeamProps) => {
  return (
    <TeamContainer>
      <h2>{name}</h2>
      <TeamLayout>
        <div>
          {players.map((player, index) => (
            <PlayerItem key={index}>
              <p>{player.name}</p>
              <p>Runs: {player.runs}</p>
              {player.isBatting && <img width="32px" src="/icons/png/006-cricket-1.png" />}
              {
                // display allActions in a comma separated list
                player.allActions.length > 0 && <p>{player.allActions.join(', ')}</p>
              }
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
