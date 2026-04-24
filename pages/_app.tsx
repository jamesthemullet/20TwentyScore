import type { AppProps } from 'next/app';
import { Global, css } from '@emotion/react';
import { GameProvider } from '../context/GameContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GameProvider>
      <Global styles={css`body { margin: 0; }`} />
      <Component {...pageProps} />
    </GameProvider>
  );
}
