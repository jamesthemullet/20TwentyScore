import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import Layout from '../components/layout/layout';
import Scoreboard from '../components/scoreboard/scoreboard';
import { useGameScore } from '../context/GameScoreContext';
import { GameScore } from '../context/GameContext';

const ScoreboardPage: React.FC = () => {
  const { gameScore, setGameScore } = useGameScore();
  const [mounted, setMounted] = useState(false);
  const [hasGameData, setHasGameData] = useState(false);

  useEffect(() => {
    const contextHasGame = gameScore.some((team) => team.players.some((p) => p.currentBowler));
    if (contextHasGame) {
      setHasGameData(true);
      setMounted(true);
      return;
    }

    const saved = localStorage.getItem('gameData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as GameScore;
        setGameScore(parsed);
        setHasGameData(true);
      } catch {
        // corrupted — leave hasGameData false
      }
    }
    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout>
      <Main aria-label="Scorecard">
        {mounted && (
          <>
            {hasGameData ? (
              <Scoreboard handleShowTeam={() => undefined} />
            ) : (
              <EmptyState>
                <p>No active game found.</p>
                <Link href="/">Start a new game</Link>
              </EmptyState>
            )}
          </>
        )}
      </Main>
    </Layout>
  );
};

export default ScoreboardPage;

const Main = styled.main`
  position: relative;
  width: 100%;
  max-width: 2000px;
  margin: 0 auto;
  flex: 1;
  justify-content: center;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;

  a {
    color: #333;
    font-weight: bold;
  }
`;
