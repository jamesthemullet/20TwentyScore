import React, { useState } from 'react';
import Layout from '../components/layout/layout';
import styled from '@emotion/styled';
import Scoring from '../components/scoring/scoring';
import Scoreboard from '../components/scoreboard/scoreboard';
import { PrimaryButton, SecondaryButton } from '../components/core/buttons';
import { useGameScore } from '../context/GameScoreContext';
import { useOvers } from '../context/OversContext';
import defaultPlayers from '../components/core/players';
import PitchDiagram from '../components/pitch/pitch-diagram';

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  import('accented').then(({ accented }) => {
    accented();
  });
}

const cricketQuotes = [
  { text: "What do they know of cricket who only cricket know?", author: "C.L.R. James" },
  { text: "Captaincy is 90 per cent luck and 10 per cent skill, but don't try it without that 10 per cent.", author: "Richie Benaud" },
  { text: "Cricket is the greatest game that the wit of man has yet devised.", author: "Sir Pelham Warner" },
  { text: "I never looked at the scoreboard. I just kept playing my game.", author: "Viv Richards" },
  { text: "You don't play for the records. You play for the love of the game.", author: "Sachin Tendulkar" },
  { text: "To me, cricket is a simple game. Keep it simple and enjoy it.", author: "Shane Warne" },
  { text: "Cricket is not just a sport — it is an expression of who we are.", author: "Sir Garfield Sobers" },
];

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

  const dailyQuote = cricketQuotes[new Date().getDay()];

  return (
    <Layout>
      <Main aria-label="Scoreboard">
        <Welcome>Welcome to 20Twenty Score</Welcome>
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
                      Twenty overs,
                      <br />
                      two teams,
                      <br />
                      one scoresheet.
                    </Tagline>
                    <Description>
                      A hand-kept ledger for your Saturday-afternoon T20s — ball by ball, over by
                      over, with a running tally any pavilion would be proud of.
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
                  <SecondaryButton onClick={() => loadGame()}>Resume Saved Match</SecondaryButton>
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
        <Divider />
        <Quote>
          <p>&ldquo;{dailyQuote.text}&rdquo;</p>
          <cite>— {dailyQuote.author}</cite>
        </Quote>
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
  margin-top: 1rem;
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

const Welcome = styled.h2`
  font-family: 'Pacifico', cursive;
  font-size: 2.5rem;
  color: #222;
  margin: 0;
  padding: 1.5rem 1rem 0;
  text-align: center;
  width: 100%;

  @media (min-width: 640px) {
    font-size: 3.25rem;
  }
`;

const Tagline = styled.p`
  font-family: 'Pacifico', cursive;
  font-size: 2.75rem;
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

const Divider = styled.hr`
  width: 100%;
  border: none;
  border-top: 1px solid #ddd;
  margin: 2rem 0 0;
`;

const Quote = styled.footer`
  width: 100%;
  padding: 1.25rem 1rem 2rem;
  text-align: center;

  p {
    font-family: Georgia, serif;
    font-size: 0.9rem;
    font-style: italic;
    color: #666;
    margin: 0 0 0.25rem;
  }

  cite {
    font-family: 'Oswald', sans-serif;
    font-size: 0.75rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #767676;
    font-style: normal;
  }
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
    color: #666;

    &::before {
      content: '';
      display: inline-block;
      width: 14px;
      height: 14px;
      background-image: url('/icons/png/001-cricket.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      margin-right: 0.5rem;
      vertical-align: middle;
    }
  }
`;
