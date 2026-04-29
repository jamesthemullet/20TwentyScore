import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { Global, css } from '@emotion/react';
import { GameProvider } from '../context/GameContext';
import { useGameScore } from '../context/GameScoreContext';

function GameStatePersister() {
  const { gameScore } = useGameScore();
  useEffect(() => {
    const gameStarted = gameScore.some((team) => team.players.some((p) => p.currentBowler));
    if (gameStarted) {
      localStorage.setItem('gameData', JSON.stringify(gameScore));
    }
  }, [gameScore]);
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GameProvider>
      <GameStatePersister />
      <Global styles={css`body { margin: 0; }`} />
      <Component {...pageProps} />
    </GameProvider>
  );
}
