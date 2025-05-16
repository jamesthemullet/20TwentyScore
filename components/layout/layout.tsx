import React, { ReactNode } from 'react';
import Header from '../header/header';
import Footer from '../footer/footer';
import Meta from '../meta/meta';
import styled from '@emotion/styled';

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => {
  // const seo = null;

  return (
    <SiteContainer>
      <Meta />
      <Header />
      <Content>{props.children}</Content>
      <Footer />
    </SiteContainer>
  );
};

const SiteContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default Layout;
