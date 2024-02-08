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
      <Page>
        <Header />
        {props.children}
        <Footer />
      </Page>
    </>
  );
};

export default Layout;

const Page = styled.div`
  font-family: Arial, sans-serif;
  width: 100%;
`;
