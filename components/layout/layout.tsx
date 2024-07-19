import React, { ReactNode } from 'react';
import Header from '../header/header';
import Footer from '../footer/footer';
import Meta from '../meta/meta';
import styled from 'styled-components';

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => {
  const seo = null;

  return (
    <SiteContainer>
      <Meta />
      <Header />
      <Main>{props.children}</Main>
      <Footer />
    </SiteContainer>
  );
};

const SiteContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Main = styled.main`
  flex: 1;
`;

export default Layout;
