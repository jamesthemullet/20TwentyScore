import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import Meta from './meta';
import Scoreboard from './Scoreboard';
import Nav from './nav';

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => {
  const seo = null;

  return (
    <>
      <Meta />
      <Nav />
      <Header />
      {props.children}
      <Footer />
    </>
  );
};

export default Layout;
