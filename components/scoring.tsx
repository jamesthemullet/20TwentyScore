import { SquareButton } from './core-components';

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
    onScoreUpdate(teamIndex, playerIndex, runs, action);
    onOverUpdate(action);
  };
  return (
    <div>
      <h2>Scoring</h2>
      <div>
        <SquareButton onClick={() => handleScoreClick(1, currentStriker.index, 0, null)}>
          0
        </SquareButton>
        <SquareButton onClick={() => handleScoreClick(1, currentStriker.index, 1, null)}>
          1
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
        <SquareButton onClick={() => handleScoreClick(1, currentStriker.index, 0, 'Next Ball')}>
          Next Ball
        </SquareButton>
      </div>
    </div>
  );
};

export default Scoring;
