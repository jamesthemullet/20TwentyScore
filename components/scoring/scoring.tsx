import styled from '@emotion/styled';
import { SquareButton } from '../core/buttons';
import { useState } from 'react';
import { useGameScore } from '../../context/GameScoreContext';
import { useMostRecentAction } from '../../context/MostRecentActionContext';

type ScoringProps = {
  onOverUpdate: (action: null | string) => void;
};

const Scoring = ({ onOverUpdate }: ScoringProps) => {
  const [countRuns, setCountRuns] = useState(0);
  const [nextRunButtonDisabled, setNextRunButtonDisabled] = useState(true);

  const { setPlayerScore, gameScore } = useGameScore();
  const { setMostRecentAction } = useMostRecentAction();

  const currentStriker = gameScore[0].players.find((player) => player.isBatting);

  if (!currentStriker) {
    return null;
  }

  const handleScoreClick = (
    teamIndex: number,
    playerIndex: number,
    runs: number,
    action: null | string
  ) => {
    if (action === 'wait') {
      setCountRuns((prevCountRuns) => prevCountRuns + runs);
      setNextRunButtonDisabled(false);
      return;
    } else if (action === 'Next Ball') {
      updateGame(teamIndex, playerIndex, countRuns, action);
    } else {
      updateGame(teamIndex, playerIndex, runs, action);
    }
    setCountRuns(0);
    onOverUpdate(action);
    setNextRunButtonDisabled(true);
  };

  const updateGame = (
    teamIndex: number,
    playerIndex: number,
    runs: number,
    action: null | string
  ) => {
    setPlayerScore(teamIndex, playerIndex, runs, action);
    setMostRecentAction({ runs, action });
  };

  return (
    <ScoringContainer>
      <h2>Scoring</h2>
      <ScoringGrid>
        <SquareButton onClick={() => handleScoreClick(1, currentStriker.index, 0, null)}>
          0
        </SquareButton>
        <SquareButton onClick={() => handleScoreClick(1, currentStriker.index, 1, null)}>
          1 & next ball
        </SquareButton>
        <SquareButton onClick={() => handleScoreClick(1, currentStriker.index, 1, 'wait')}>
          1+
        </SquareButton>
        <SquareButton onClick={() => handleScoreClick(1, currentStriker.index, 4, null)}>
          4
        </SquareButton>
        <SquareButton onClick={() => handleScoreClick(1, currentStriker.index, 6, null)}>
          6
        </SquareButton>
        <SquareButton onClick={() => handleScoreClick(1, currentStriker.index, 0, 'Wicket')}>
          Wicket
        </SquareButton>
        <SquareButton onClick={() => handleScoreClick(1, currentStriker.index, 1, 'No Ball')}>
          No Ball
        </SquareButton>
        <SquareButton onClick={() => handleScoreClick(1, currentStriker.index, 1, 'Wide')}>
          Wide
        </SquareButton>
        <SquareButton
          disabled={nextRunButtonDisabled}
          onClick={() => handleScoreClick(1, currentStriker.index, 0, 'Next Ball')}>
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
