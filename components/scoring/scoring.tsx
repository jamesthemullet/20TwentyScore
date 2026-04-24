import styled from '@emotion/styled';
import { SquareButton } from '../core/buttons';
import { useState } from 'react';
import { useGameScore } from '../../context/GameScoreContext';
import { useMostRecentAction } from '../../context/MostRecentActionContext';
import { useOvers } from '../../context/OversContext';
import { HomeContainer } from '../core/home-container';
import { StyledHeading2 } from '../core/heading';

const BALLS_PER_OVER = 6;
const WICKETS_FOR_ALL_OUT = 9; // 9 conceded means 10th wicket falls next
const FINAL_OVER_INDEX = 19; // T20: overs 0–19

type ScoringProps = {
  setSelectBowler: (setBowler: boolean) => void;
};

const Scoring = ({ setSelectBowler }: ScoringProps) => {
  const [countRuns, setCountRuns] = useState(0);
  const [nextRunButtonDisabled, setNextRunButtonDisabled] = useState(true);
  const [awaitingMethodOfWicket, setAwaitingMethodOfWicket] = useState(false);

  const { setBattingPlayerScore, gameScore, swapBatsmen, setBowlingPlayerScore } = useGameScore();
  const { setMostRecentAction } = useMostRecentAction();
  const {
    currentBallInThisOver,
    setCurrentBallInThisOver,
    setCurrentOvers,
    currentExtrasInThisOver,
    setCurrentExtrasInThisOver,
    resetOvers
  } = useOvers();

  const currentBattingTeam = gameScore.find((team) => team.currentBattingTeam);
  const currentBowlingTeam = gameScore.find((team) => team.currentBowlingTeam);

  if (!currentBattingTeam || !currentBowlingTeam) {
    return;
  }

  const currentBattingTeamIndex = currentBattingTeam.index;

  const currentStriker = gameScore[currentBattingTeamIndex].players.find(
    (player) => player.currentStriker
  );
  const currentNonStriker = gameScore[currentBattingTeamIndex].players.find(
    (player) => player.currentNonStriker
  );

  const endOfOver = () => currentBallInThisOver === BALLS_PER_OVER + currentExtrasInThisOver;

  const endOfInnings = (action: string | null) =>
    (currentBattingTeam.totalWicketsConceded === WICKETS_FOR_ALL_OUT && action === 'Wicket') ||
    (currentBattingTeam.overs === FINAL_OVER_INDEX && endOfOver());

  const endOfGame = () => gameScore.every((team) => team.finishedBatting === true);

  const handleScoreClick = (
    playerIndex: number | undefined,
    runs: number,
    action: null | string,
    methodOfWicket?: 'LBW' | 'Caught' | 'Run Out'
  ) => {
    if (playerIndex === undefined) {
      return;
    }
    if (action === 'wait') {
      setCountRuns((prevCountRuns) => prevCountRuns + runs);
      setNextRunButtonDisabled(false);
      return;
    } else if (action === 'Next Ball') {
      updateGame(currentBattingTeamIndex, playerIndex, countRuns, action);
    } else {
      updateGame(currentBattingTeamIndex, playerIndex, runs, action, methodOfWicket);
    }
    setCountRuns(0);
    updateOver(action);
    setNextRunButtonDisabled(true);
  };

  const updateOver = (action: null | string) => {
    if (action === 'No Ball' || action === 'Wide') {
      setCurrentExtrasInThisOver(1);
      setCurrentBallInThisOver(null);
      return;
    }

    if (endOfOver()) {
      setCurrentBallInThisOver(1);
      setCurrentOvers(undefined);
      setCurrentExtrasInThisOver('reset');

      if (action !== 'Wicket' && currentStriker && currentNonStriker) {
        swapBatsmen();
      }

      setSelectBowler(false);
    } else {
      setCurrentBallInThisOver(null);
      setAwaitingMethodOfWicket(false);
    }

    if (endOfInnings(action)) {
      resetOvers();
    }
  };

  const updateGame = (
    currentBattingTeamIndex: number,
    currentStriker: number,
    runs: number,
    action: null | string,
    methodOfWicket?: 'LBW' | 'Caught' | 'Run Out'
  ) => {
    setBattingPlayerScore(
      currentBattingTeamIndex,
      currentStriker,
      runs,
      action,
      endOfOver(),
      endOfInnings(action),
      methodOfWicket || null
    );
    setBowlingPlayerScore(action, endOfOver());
    setMostRecentAction({ runs, action });
  };

  return (
    <HomeContainer>
      <StyledHeading2>Scoring</StyledHeading2>
      <ScoringGrid>
        <SquareButton
          disabled={endOfGame() || awaitingMethodOfWicket}
          onClick={() => handleScoreClick(currentStriker?.index, 0, null)}>
          0
        </SquareButton>
        <SquareButton
          disabled={endOfGame() || awaitingMethodOfWicket}
          onClick={() => handleScoreClick(currentStriker?.index, 1, null)}>
          1 & next ball
        </SquareButton>
        <SquareButton
          disabled={endOfGame() || awaitingMethodOfWicket}
          onClick={() => handleScoreClick(currentStriker?.index, 1, 'wait')}>
          1+
        </SquareButton>
        <SquareButton
          disabled={endOfGame() || awaitingMethodOfWicket}
          onClick={() => handleScoreClick(currentStriker?.index, 4, null)}>
          4
        </SquareButton>
        <SquareButton
          disabled={endOfGame() || awaitingMethodOfWicket}
          onClick={() => handleScoreClick(currentStriker?.index, 6, null)}>
          6
        </SquareButton>
        <SquareButton
          disabled={endOfGame() || awaitingMethodOfWicket}
          onClick={() => handleScoreClick(currentStriker?.index, 1, 'No Ball')}>
          No Ball
        </SquareButton>
        <SquareButton
          disabled={endOfGame() || awaitingMethodOfWicket}
          onClick={() => setAwaitingMethodOfWicket(true)}>
          Wicket
        </SquareButton>
        <SquareButton
          disabled={endOfGame() || awaitingMethodOfWicket}
          onClick={() => handleScoreClick(currentStriker?.index, 1, 'Wide')}>
          Wide
        </SquareButton>
        <SquareButton
          disabled={nextRunButtonDisabled || endOfGame() || awaitingMethodOfWicket}
          onClick={() => handleScoreClick(currentStriker?.index, 0, 'Next Ball')}>
          Next Ball
        </SquareButton>
      </ScoringGrid>
      {awaitingMethodOfWicket && (
        <>
          {' '}
          <StyledHeading2>Method Of Wicket</StyledHeading2>
          <ScoringGrid>
            <SquareButton
              disabled={endOfGame()}
              onClick={() => handleScoreClick(currentStriker?.index, 0, 'Wicket', 'LBW')}>
              LBW
            </SquareButton>
            <SquareButton
              disabled={endOfGame()}
              onClick={() => handleScoreClick(currentStriker?.index, 0, 'Wicket', 'Caught')}>
              Caught
            </SquareButton>
            <SquareButton
              disabled={endOfGame()}
              onClick={() => handleScoreClick(currentStriker?.index, 0, 'Wicket', 'Run Out')}>
              Run Out
            </SquareButton>
          </ScoringGrid>
        </>
      )}
    </HomeContainer>
  );
};

const ScoringGrid = styled.div`
  transition: flex 0.3s;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
  margin-bottom: 20px;
`;

export default Scoring;
