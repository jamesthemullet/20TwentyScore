import styled from '@emotion/styled';
import { SquareButton } from '../core/buttons';

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
  currentStriker: Player;
};

const Scoring = ({ onScoreUpdate, onOverUpdate, currentStriker }: ScoringProps) => {
  const handleScoreClick = (
    teamIndex: number,
    playerIndex: number,
    runs: number,
    action: null | string
  ) => {
    console.log(10);
    onScoreUpdate(teamIndex, playerIndex, runs, action);
    onOverUpdate(action);
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
        <SquareButton onClick={() => handleScoreClick(1, currentStriker.index, 1, null)}>
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
          disabled
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
