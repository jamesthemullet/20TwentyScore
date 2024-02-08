import React, { ReactNode } from 'react';
import Header from './Header';
import styled from '@emotion/styled';
import Footer from './Footer';
import Meta from './meta';
import Scoreboard from './Scoreboard';

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => {
  const seo = null;
  return (
    <>
      <Meta />
      <Header />
      {props.children}
      <Footer />
    </>
  );
};

export default Layout;
