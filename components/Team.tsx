import React from 'react';
import styled from 'styled-components';

type TeamProps = {
  name: string;
};

const Team = ({ name }: TeamProps) => {
  return (
    <TeamContainer>
      <h2>{name}</h2>
      <TeamLayout>
        <div>
          <p>Player 1</p>
          <p>Player 2</p>
          <p>Player 3</p>
          <p>Player 4</p>
          <p>Player 5</p>
          <p>Player 6</p>
          <p>Player 7</p>
          <p>Player 8</p>
          <p>Player 9</p>
          <p>Player 10</p>
          <p>Player 11</p>
          <img width="32px" src="/icons/png/006-cricket-1.png" />
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
