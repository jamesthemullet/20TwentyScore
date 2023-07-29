import { SquareButton } from './core-components';

type ScoringProps = {
  onScoreUpdate: (
    teamIndex: number,
    playerIndex: number,
    runs: number,
    action: null | string
  ) => void;
};

const Scoring = ({ onScoreUpdate }: ScoringProps) => {
  const handleScoreClick = (
    teamIndex: number,
    playerIndex: number,
    runs: number,
    action: null | string
  ) => {
    onScoreUpdate(teamIndex, playerIndex, runs, action);
  };
  return (
    <div>
      <h2>Scoring</h2>
      <div>
        <SquareButton onClick={() => handleScoreClick(1, 0, 0, null)}>0</SquareButton>
        <SquareButton onClick={() => handleScoreClick(1, 0, 1, null)}>1</SquareButton>
        <SquareButton onClick={() => handleScoreClick(1, 0, 4, null)}>4</SquareButton>
        <SquareButton onClick={() => handleScoreClick(1, 0, 6, null)}>6</SquareButton>
        <SquareButton onClick={() => handleScoreClick(1, 0, 0, 'Wicket')}>Wicket</SquareButton>
        <SquareButton onClick={() => handleScoreClick(1, 0, 1, 'No Ball')}>No Ball</SquareButton>
        <SquareButton onClick={() => handleScoreClick(1, 0, 1, 'Wide')}>Wide</SquareButton>
        <SquareButton onClick={() => handleScoreClick(1, 0, 0, 'Next Ball')}>
          Next Ball
        </SquareButton>
      </div>
    </div>
  );
};

export default Scoring;
