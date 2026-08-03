import styled from '@emotion/styled';
import { useState } from 'react';
import { useGameScore } from '../../context/GameScoreContext';
import { useMostRecentAction } from '../../context/MostRecentActionContext';
import { useOvers } from '../../context/OversContext';
import { SquareButton } from '../core/buttons';
import { HomeContainer } from '../core/home-container';

const BALLS_PER_OVER = 6;
const WICKETS_FOR_ALL_OUT = 9; // 9 conceded means 10th wicket falls next
const FINAL_OVER_INDEX = 19; // T20: overs 0–19

type ScoringProps = {
  setSelectBowler: () => void;
};

const Scoring = ({ setSelectBowler }: ScoringProps) => {
  const [countRuns, setCountRuns] = useState(0);
  const [nextRunButtonDisabled, setNextRunButtonDisabled] = useState(true);
  const [awaitingMethodOfWicket, setAwaitingMethodOfWicket] = useState(false);

  const { setBattingPlayerScore, gameScore, swapBatsmen, setBowlingPlayerScore, undo, canUndo } =
    useGameScore();
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
    return null;
  }

  const currentBattingTeamIndex = currentBattingTeam.index;

  const currentStriker = gameScore[currentBattingTeamIndex].players.find(
    (player) => player.currentStriker
  );
  const currentNonStriker = gameScore[currentBattingTeamIndex].players.find(
    (player) => player.currentNonStriker
  );

  const endOfOver = (): boolean => currentBallInThisOver === BALLS_PER_OVER + currentExtrasInThisOver;

  const endOfInnings = (action: string | null): boolean =>
    (currentBattingTeam.totalWicketsConceded === WICKETS_FOR_ALL_OUT && action === 'Wicket') ||
    (currentBattingTeam.overs === FINAL_OVER_INDEX && endOfOver());

  const endOfGame = (): boolean => gameScore.every((team) => team.finishedBatting === true);

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

  const updateOver = (action: null | string): void => {
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

      setSelectBowler();
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
  ): void => {
    setBattingPlayerScore(
      currentBattingTeamIndex,
      currentStriker,
      runs,
      action,
      endOfOver(),
      endOfInnings(action),
      methodOfWicket || null
    );
    setBowlingPlayerScore(action, runs, endOfOver());
    setMostRecentAction({ runs, action });
  };

  return (
    <HomeContainer>
      <ScoringHeader>
        <ScoringTitle>Scorer&apos;s pad</ScoringTitle>
        <TapLabel>Tap to record</TapLabel>
      </ScoringHeader>
      <ScoringGrid>
        <SquareButton
          disabled={endOfGame() || awaitingMethodOfWicket}
          onClick={() => handleScoreClick(currentStriker?.index, 0, null)}>
          0<ButtonSub>dot ball</ButtonSub>
        </SquareButton>
        <SquareButton
          disabled={endOfGame() || awaitingMethodOfWicket}
          onClick={() => handleScoreClick(currentStriker?.index, 1, null)}>
          1<ButtonSub>and next ball</ButtonSub>
        </SquareButton>
        <SquareButton
          disabled={endOfGame() || awaitingMethodOfWicket}
          onClick={() => handleScoreClick(currentStriker?.index, 1, 'wait')}>
          1+<ButtonSub>wait for run</ButtonSub>
        </SquareButton>
        <RedSquareButton
          disabled={endOfGame() || awaitingMethodOfWicket}
          onClick={() => handleScoreClick(currentStriker?.index, 4, null)}>
          4<ButtonSub>four</ButtonSub>
        </RedSquareButton>
        <GoldSquareButton
          disabled={endOfGame() || awaitingMethodOfWicket}
          onClick={() => handleScoreClick(currentStriker?.index, 6, null)}>
          6<ButtonSub>six</ButtonSub>
        </GoldSquareButton>
        <SquareButton
          disabled={endOfGame() || awaitingMethodOfWicket}
          onClick={() => handleScoreClick(currentStriker?.index, 1, 'No Ball')}>
          No Ball
        </SquareButton>
        <SquareButton
          disabled={endOfGame() || awaitingMethodOfWicket}
          onClick={() => setAwaitingMethodOfWicket(true)}>
          W<ButtonSub>wicket</ButtonSub>
        </SquareButton>
        <SquareButton
          disabled={endOfGame() || awaitingMethodOfWicket}
          onClick={() => handleScoreClick(currentStriker?.index, 1, 'Wide')}>
          Wide
        </SquareButton>
        {nextRunButtonDisabled ? (
          <GhostSquareButton
            aria-label="Next ball"
            disabled={nextRunButtonDisabled || endOfGame() || awaitingMethodOfWicket}
            onClick={() => handleScoreClick(currentStriker?.index, 0, 'Next Ball')}>
            <span aria-hidden="true">↵</span>
            <ButtonSub>next ball</ButtonSub>
          </GhostSquareButton>
        ) : (
          <RedSquareButton
            aria-label="Next ball"
            disabled={endOfGame() || awaitingMethodOfWicket}
            onClick={() => handleScoreClick(currentStriker?.index, 0, 'Next Ball')}>
            <span aria-hidden="true">↵</span>
            <ButtonSub>next ball</ButtonSub>
          </RedSquareButton>
        )}
      </ScoringGrid>
      <ScoringFooter>
        <FooterHint>Touch a result to record the ball</FooterHint>
        <UndoButton onClick={undo} disabled={!canUndo}>
          <span aria-hidden="true">↩</span> Undo
        </UndoButton>
      </ScoringFooter>
      <MethodOfWicketRegion aria-live="polite">
        {awaitingMethodOfWicket && (
          <>
            <ScoringHeader>
              <ScoringTitle>Method of wicket</ScoringTitle>
            </ScoringHeader>
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
      </MethodOfWicketRegion>
    </HomeContainer>
  );
};

const ScoringFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-top: 16px;
  border-top: 1px solid #ccc;
  margin-top: 6px;
  margin-bottom: 20px;
`;

const FooterHint = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #666;
`;

const UndoButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #1a1a1a;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

const ScoringHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: 100%;
  padding-bottom: 10px;
  margin-bottom: 20px;
`;

const ScoringTitle = styled.h2`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 1.5rem;
  font-weight: 400;
  color: #1a1a1a;
  margin: 0;
`;

const TapLabel = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #666;
`;

const RedSquareButton = styled(SquareButton)`
  background-color: #b83320;
  border-color: #b83320;
  box-shadow: 0 2px 0 #7a2215;
  color: #fff;

  &:hover:not(:disabled) {
    background-color: #aa0000;
    border-color: #aa0000;
  }
`;

const GoldSquareButton = styled(SquareButton)`
  background-color: #c9a84c;
  border-color: #c9a84c;
  box-shadow: 0 2px 0 #8a7030;
  color: #fff;

  &:hover:not(:disabled) {
    background-color: #b5943a;
    border-color: #b5943a;
  }
`;

const GhostSquareButton = styled(SquareButton)`
  border-color: #ddd;
  box-shadow: 0 2px 0 #ddd;
  color: #1a1a1a;
  opacity: 0.4;
`;

const ButtonSub = styled.span`
  display: block;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-size: 0.55rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: inherit;
  margin-top: 0.2rem;
`;

const MethodOfWicketRegion = styled.div`
  width: 100%;
`;

const ScoringGrid = styled.div`
  transition: flex 0.3s;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-gap: 6px;

    button {
      width: 100%;
      font-size: 1.1rem;
      padding: 0.5rem;
    }
  }
`;

export default Scoring;
