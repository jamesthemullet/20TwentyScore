import React from 'react';
import styled from '@emotion/styled';
import { useGameScore } from '../../context/GameScoreContext';

const Scoreboard = () => {
  const { mostRecentAction } = useGameScore();
  const { runs, action } = mostRecentAction;
  return (
    <ScoreboardContainer>
      <h2>Scoreboard</h2>
      <ScoreboardLayout>
        <div>
          <p>Team 1</p>
          <p>Runs - Wickets (Overs)</p>
        </div>
        <div>
          <p>Team 2</p>
          <p>Runs - Wickets (Overs)</p>
        </div>
      </ScoreboardLayout>
      {mostRecentAction && (
        <p>
          Most recent ball: {runs && `${runs} runs`} {action}{' '}
        </p>
      )}
    </ScoreboardContainer>
  );
};

export default Scoreboard;

const ScoreboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid black;
  border-radius: 5px;
  padding: 10px;
  flex: 3;
  width: 100%;

  h2 {
    margin-bottom: 1rem;
    height: 2rem;
    font-size: 1.5rem;
  }
`;

const ScoreboardLayout = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1rem;
  gap: 5rem;

  & > div:last-of-type {
    text-align: right;
  }
`;
