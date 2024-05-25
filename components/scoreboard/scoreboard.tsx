import React from 'react';
import styled from '@emotion/styled';
import { useMostRecentAction } from '../../context/MostRecentActionContext';
import { useOvers } from '../../context/OversContext';
import { useGameScore } from '../../context/GameScoreContext';
import { pluralise } from '../../utils/pluralise';
import { HomeContainer } from '../core/home-container';
import { StyledHeading2 } from '../core/heading';

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
        {team.totalRuns} {pluralise(team.totalRuns, 'run', 'runs')} - {team.totalWickets}{' '}
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

  const isGameADraw = () =>
    team1.totalRuns === team2.totalRuns && team1.finishedBatting && team2.finishedBatting;

  return (
    <HomeContainer>
      <StyledHeading2>Scoreboard</StyledHeading2>
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
      {gameScore[0].finishedBatting && gameScore[1].finishedBatting && !isGameADraw() && (
        <>
          <p>Game Over</p>
          <p>The winner is:</p>
          <p>{team1.totalRuns > team2.totalRuns ? 'Team 1' : 'Team 2'}</p>
        </>
      )}
      {gameScore[0].finishedBatting && gameScore[1].finishedBatting && isGameADraw() && (
        <>
          <p>Game Over</p>
          <p>It&apos;s a draw!</p>
        </>
      )}
    </HomeContainer>
  );
};

export default Scoreboard;

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
