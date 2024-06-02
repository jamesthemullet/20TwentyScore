import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { GameScoreProvider } from '../context/GameScoreContext';

import { css, Global } from '@emotion/react';
import { MostRecentActionProvider } from '../context/MostRecentActionContext';
import { OversProvider } from '../context/OversContext';

const GlobalStyles = () => (
  <Global
    styles={css`
      @font-face {
        font-family: 'Oswald';
        src: url('/fonts/Oswald-VariableFont_wght.ttf') format('truetype');
        font-weight: 300;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Kurale';
        src: url('/fonts/Kurale-Regular.ttf') format('truetype');
        font-weight: 300;
        font-style: normal;
        font-display: swap;
      }
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
      }
    `}
  />
);

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <SessionProvider session={pageProps.session}>
      <GlobalStyles />
      <GameScoreProvider>
        <OversProvider>
          <MostRecentActionProvider>
            <Component {...pageProps} />
          </MostRecentActionProvider>
        </OversProvider>
      </GameScoreProvider>
    </SessionProvider>
  );
};

export default App;
