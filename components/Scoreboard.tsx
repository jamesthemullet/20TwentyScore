import React from 'react';
import styled from 'styled-components';

const Scoreboard = () => {
  return (
    <ScoreboardContainer>
      <h2>Scoreboard</h2>
      <ScoreboardLayout>
        <div>
          <div>Team 1</div>
          <div>Runs - Wickets (Overs)</div>
        </div>
        <div>
          <div>Team 2</div>
          <div>Runs - Wickets (Overs)</div>
        </div>
      </ScoreboardLayout>
    </ScoreboardContainer>
  );
};

export default Scoreboard;

const ScoreboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40%;
  border: 1px solid black;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
`;

const ScoreboardLayout = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1rem;
  gap: 5rem;

  // div last of type
  & > div:last-of-type {
    text-align: right;
  }
`;
