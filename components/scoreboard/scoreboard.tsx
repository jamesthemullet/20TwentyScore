import React from 'react';
import styled from '@emotion/styled';
import { useMostRecentAction } from '../../context/MostRecentActionContext';
import { useOvers } from '../../context/OversContext';
import { useGameScore } from '../../context/GameScoreContext';
import { pluralise } from '../../utils/pluralise';

const addPlural = (runs: number) => (runs === 1 ? 'run' : 'runs');

type TeamScoreProps = {
  team: {
    name: string;
    totalRuns: number;
    totalWickets: number;
    overs: number;
  };
};

const TeamScore = ({ team }: TeamScoreProps) => {
  return (
    <div>
      <p>{team.name}</p>
      <p>
        {team.totalRuns} {pluralise(team.totalRuns, 'run', 'runs')} - {team.totalWickets}
        {pluralise(team.totalWickets, 'wicket', 'wickets')}
        <br />({team.overs} {pluralise(team.overs, 'over', 'overs')})
      </p>
    </div>
  );
};

const Scoreboard = () => {
  const { mostRecentAction } = useMostRecentAction();
  const { currentBallInThisOver, currentExtrasInThisOver, currentOver } = useOvers();
  const { runs, action } = mostRecentAction;
  const { gameScore } = useGameScore();

  const team1 = gameScore[0];
  const team2 = gameScore[1];

  return (
    <ScoreboardContainer>
      <StyledHeading>Scoreboard</StyledHeading>
      <ScoreboardLayout>
        <TeamScore team={team1} />
        <TeamScore team={team2} />
      </ScoreboardLayout>
      {mostRecentAction && (
        <p>
          Most recent ball:{' '}
          {(!action || action === 'Next Ball') &&
            runs !== null &&
            runs !== undefined &&
            `${runs} ${addPlural(runs)}`}{' '}
          {action !== 'Next Ball' && action}{' '}
        </p>
      )}
      <div>
        <p>
          Over: {currentOver} Ball: {currentBallInThisOver} (extras: {currentExtrasInThisOver})
        </p>
      </div>
      {gameScore[0].finishedBatting && gameScore[1].finishedBatting && (
        <>
          <p>Game Over</p>
          <p>The winner is:</p>
          <p>{team1.totalRuns > team2.totalRuns ? 'Team 1' : 'Team 2'}</p>
        </>
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

const StyledHeading = styled.h2`
  text-align: center;
  margin: 0;
  padding: 1rem;
  font-size: 2rem;
  border-bottom: 1px solid #ccc;
  font-family: 'Oswald', sans-serif;
`;
