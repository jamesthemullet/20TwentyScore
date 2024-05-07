import styled from '@emotion/styled';
import { SquareButton } from '../core/buttons';
import { useState } from 'react';
import { useGameScore } from '../../context/GameScoreContext';
import { useMostRecentAction } from '../../context/MostRecentActionContext';
import { useOvers } from '../../context/OversContext';

const Scoring = () => {
  const [countRuns, setCountRuns] = useState(0);
  const [nextRunButtonDisabled, setNextRunButtonDisabled] = useState(true);

  const { setPlayerScore, gameScore, swapBatsmen } = useGameScore();
  const { setMostRecentAction } = useMostRecentAction();
  const {
    currentBallInThisOver,
    setCurrentBallInThisOver,
    incrementCurrentOver,
    currentExtrasInThisOver,
    setCurrentExtrasInThisOver
  } = useOvers();

  const currentBattingTeam = gameScore.find((team) => team.currentBattingTeam);
  if (!currentBattingTeam) {
    return;
  }
  const currentBattingTeamIndex = currentBattingTeam.index;

  const currentStriker = gameScore[currentBattingTeamIndex].players.find(
    (player) => player.currentStriker
  );
  const currentNonStriker = gameScore[currentBattingTeamIndex].players.find(
    (player) => player.currentNonStriker
  );

  const endOfOver = () => currentBallInThisOver === 6 + currentExtrasInThisOver;

  const endOfInnings = (action: string | null) =>
    (currentBattingTeam.totalWickets === 9 && action === 'Wicket') ||
    (currentBattingTeam.overs === 19 && endOfOver());

  const handleScoreClick = (
    playerIndex: number | undefined,
    runs: number,
    action: null | string
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
      updateGame(currentBattingTeamIndex, playerIndex, runs, action);
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
      incrementCurrentOver();
      setCurrentExtrasInThisOver('reset');

      if (action !== 'Wicket' && currentStriker && currentNonStriker) {
        swapBatsmen(currentStriker, currentNonStriker);
      }
    } else {
      setCurrentBallInThisOver(null);
    }
  };

  const updateGame = (
    teamIndex: number,
    playerIndex: number,
    runs: number,
    action: null | string
  ) => {
    setPlayerScore(teamIndex, playerIndex, runs, action, endOfOver(), endOfInnings(action));
    setMostRecentAction({ runs, action });
  };

  return (
    <ScoringContainer>
      <h2>Scoring</h2>
      <ScoringGrid>
        <SquareButton onClick={() => handleScoreClick(currentStriker?.index, 0, null)}>
          0
        </SquareButton>
        <SquareButton onClick={() => handleScoreClick(currentStriker?.index, 1, null)}>
          1 & next ball
        </SquareButton>
        <SquareButton onClick={() => handleScoreClick(currentStriker?.index, 1, 'wait')}>
          1+
        </SquareButton>
        <SquareButton onClick={() => handleScoreClick(currentStriker?.index, 4, null)}>
          4
        </SquareButton>
        <SquareButton onClick={() => handleScoreClick(currentStriker?.index, 6, null)}>
          6
        </SquareButton>
        <SquareButton onClick={() => handleScoreClick(currentStriker?.index, 0, 'Wicket')}>
          Wicket
        </SquareButton>
        <SquareButton onClick={() => handleScoreClick(currentStriker?.index, 1, 'No Ball')}>
          No Ball
        </SquareButton>
        <SquareButton onClick={() => handleScoreClick(currentStriker?.index, 1, 'Wide')}>
          Wide
        </SquareButton>
        <SquareButton
          disabled={nextRunButtonDisabled}
          onClick={() => handleScoreClick(currentStriker?.index, 0, 'Next Ball')}>
          Next Ball
        </SquareButton>
      </ScoringGrid>
    </ScoringContainer>
  );
};

const ScoringContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid black;
  border-radius: 5px;
  padding: 10px;
  flex: 3;
`;

const ScoringGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
`;

export default Scoring;
