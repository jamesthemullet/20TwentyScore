import React, { useState } from 'react';
import Layout from '../components/layout/layout';
import styled from '@emotion/styled';
import Scoring from '../components/scoring/scoring';
import Scoreboard from '../components/scoreboard/scoreboard';
import { PrimaryButton } from '../components/core/buttons';
import { useGameScore } from '../context/GameScoreContext';
import { useOvers } from '../context/OversContext';
import defaultPlayers from '../components/core/players';
import PitchDiagram from '../components/pitch/pitch-diagram';

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  import('accented').then(({ accented }) => {
    accented();
  });
}

const Index: React.FC = () => {
  const [gameInitialised, setGameInitialised] = useState(false);
  const [selectBowler, setSelectBowler] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setGameScore, gameScore, setCurrentBowler } = useGameScore();
  const { currentOver } = useOvers();

  const team1 = gameScore.find((team) => team.index === 1);

  const loadGame = () => {
    const gameData = localStorage.getItem('gameData');
    if (!gameData) {
      setError('No game data found');
      return;
    }
    try {
      const parsedGameData = JSON.parse(gameData);
      setGameScore(parsedGameData);
      setGameInitialised(true);
    } catch {
      setError('Saved game data is corrupted');
    }
  };

  const newGame = () => {
    localStorage.removeItem('gameData');
    setGameScore([
      {
        players: defaultPlayers(),
        name: 'Team 1',
        index: 0,
        totalRuns: 0,
        totalWicketsConceded: 0,
        totalWicketsTaken: 0,
        overs: 0,
        currentBattingTeam: true,
        currentBowlingTeam: false,
        finishedBatting: false
      },
      {
        players: defaultPlayers(),
        name: 'Team 2',
        index: 1,
        totalRuns: 0,
        totalWicketsConceded: 0,
        totalWicketsTaken: 0,
        overs: 0,
        currentBattingTeam: false,
        currentBowlingTeam: true,
        finishedBatting: false
      }
    ]);
    setSelectBowler(true);
  };

  const settingBowler = (teamIndex: number, playerIndex: number) => {
    setCurrentBowler(teamIndex, playerIndex);
    setSelectBowler(false);
    setGameInitialised(true);
  };

  const handleSelectBowler = () => {
    setSelectBowler(true);
  };

  return (
    <Layout>
      <Main aria-label="Scoreboard">
        {gameInitialised && !selectBowler && (
          <Board>
            <Scoreboard handleShowTeam={() => undefined} />
            <Scoring setSelectBowler={handleSelectBowler} />
          </Board>
        )}
        {(!gameInitialised || selectBowler) && (
          <StartingBox>
            {!selectBowler && (
              <>
                <HeroSection>
                  <PitchDiagram />
                  <HeroText>
                    <Tagline>
                      Twenty overs,<br />
                      two teams,<br />
                      one scoresheet.
                    </Tagline>
                    <Description>
                      A hand-kept ledger for your Saturday-afternoon T20s — ball by ball, over by over,
                      with a running tally any pavilion would be proud of.
                    </Description>
                    <FeatureList>
                      <li>Ball-by-ball</li>
                      <li>Run rates</li>
                      <li>Player figures</li>
                    </FeatureList>
                  </HeroText>
                </HeroSection>
                <ButtonsContainer>
                  <PrimaryButton onClick={() => newGame()}>Start New Match</PrimaryButton>
                  <PrimaryButton onClick={() => loadGame()}>Resume Saved Match</PrimaryButton>
                </ButtonsContainer>
              </>
            )}
            {selectBowler && (
              <>
                <h2>Select the bowler for over {currentOver}.</h2>
                {team1?.players.map((player) => (
                  <PrimaryButton
                    key={player.name}
                    onClick={() => settingBowler(team1.index, player.index)}>
                    {player.name}
                  </PrimaryButton>
                ))}
              </>
            )}
            {error && <p>{error}</p>}
          </StartingBox>
        )}
      </Main>
    </Layout>
  );
};

export default Index;

const Board = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  padding: 20px;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const Main = styled.main`
  position: relative;
  width: 100%;
  max-width: 2000px;
  margin: 0 auto;
  flex: 1;
  justify-content: center;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
`;

const StartingBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
`;

const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem 1rem 0;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
`;

const HeroText = styled.div`
  text-align: center;
  max-width: 420px;

  @media (min-width: 640px) {
    text-align: left;
  }
`;

const Tagline = styled.p`
  font-family: 'Pacifico', cursive;
  font-size: 2rem;
  color: #222;
  line-height: 1.4;
  margin: 0 0 1.25rem;
`;

const Description = styled.p`
  font-size: 1rem;
  color: #555;
  line-height: 1.7;
  margin: 0 0 1.5rem;
  font-family: Georgia, serif;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;

  @media (min-width: 640px) {
    justify-content: flex-start;
  }

  li {
    font-family: 'Oswald', sans-serif;
    font-size: 0.85rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #888;

    &::before {
      content: '—';
      margin-right: 0.4rem;
      color: #bbb;
    }
  }
`;
