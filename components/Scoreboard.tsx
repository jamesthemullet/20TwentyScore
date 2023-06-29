import React from 'react';
import styled from 'styled-components';

const Scoreboard = () => {
  return (
    <>
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
    </>
  );
};

export default Scoreboard;

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
