import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Nav from '../components/nav';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <SessionProvider session={pageProps.session}>
      <Nav />
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default App;
