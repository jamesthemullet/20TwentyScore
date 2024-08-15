import React from 'react';
import styled from '@emotion/styled';
import { useMostRecentAction } from '../../context/MostRecentActionContext';
import { useOvers } from '../../context/OversContext';
import { useGameScore } from '../../context/GameScoreContext';
import { pluralise } from '../../utils/pluralise';
import { HomeContainer } from '../core/home-container';
import { StyledHeading2 } from '../core/heading';
import { SecondaryButton } from '../core/buttons';

const addPlural = (runs: number) => (runs === 1 ? 'run' : 'runs');

type TeamScoreProps = {
  team: {
    name: string;
    totalRuns: number;
    totalWicketsConceded: number;
    overs: number;
    index: number;
  };
  showTeam: (index: number) => void;
};

type ScoreboardProps = {
  handleShowTeam: (index: number) => void;
};

const TeamScore = ({ team, showTeam }: TeamScoreProps) => {
  const [showOrHide, setShowOrHide] = React.useState(true);

  const toggleShowOrHide = (index: number) => {
    showTeam(index);
    setShowOrHide(!showOrHide);
  };
  return (
    <div>
      <p>{team.name}</p>
      <SecondaryButton onClick={() => toggleShowOrHide(team.index)}>Show Team</SecondaryButton>
      <p>
        {team.totalRuns} {pluralise(team.totalRuns, 'run', 'runs')} - {team.totalWicketsConceded}{' '}
        {pluralise(team.totalWicketsConceded, 'wicket', 'wickets')}
        <br />({team.overs} {pluralise(team.overs, 'over', 'overs')})
      </p>
    </div>
  );
};

const Scoreboard = ({ handleShowTeam }: ScoreboardProps) => {
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
        <TeamScore team={team1} showTeam={(index) => handleShowTeam(index)} />
        <TeamScore team={team2} showTeam={(index) => handleShowTeam(index)} />
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
  transition: flex 0.3s;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 5rem;

  & > div:last-of-type {
    text-align: right;
  }
`;
