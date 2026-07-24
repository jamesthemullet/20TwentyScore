import { css, Global } from '@emotion/react';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SessionProvider } from 'next-auth/react';
import { AccountProvider } from '../context/AccountContext';
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

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
    <AccountProvider>
    <GameProvider>
      <GameStatePersister />
      <Global
        styles={css`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}
      />
      <Component {...pageProps} />
      <Analytics />
    </GameProvider>
    </AccountProvider>
    </SessionProvider>
  );
}
