import styled from '@emotion/styled';
import { SquareButton } from '../core/buttons';
import { useState } from 'react';
import { useGameScore } from '../../context/GameScoreContext';

type Player = {
  index: number;
  name: string;
  runs: number;
  isBatting: boolean;
  isOnTheCrease: boolean;
  isOut: boolean;
  allActions: (string | null)[];
};

type ScoringProps = {
  onScoreUpdate: (
    teamIndex: number,
    playerIndex: number,
    runs: number,
    action: null | string
  ) => void;
  onOverUpdate: (action: null | string) => void;
};

const Scoring = ({ onScoreUpdate, onOverUpdate }: ScoringProps) => {
  const [countRuns, setCountRuns] = useState(0);
  const [nextRunButtonDisabled, setNextRunButtonDisabled] = useState(true);

  const { gameScore } = useGameScore();

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
      onScoreUpdate(teamIndex, playerIndex, countRuns, action);
    } else {
      onScoreUpdate(teamIndex, playerIndex, runs, action);
    }
    setCountRuns(0);
    onOverUpdate(action);
    setNextRunButtonDisabled(true);
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
