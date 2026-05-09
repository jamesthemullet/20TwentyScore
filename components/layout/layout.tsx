import styled from '@emotion/styled';
import type React from 'react';
import type { ReactNode } from 'react';
import Footer from '../footer/footer';
import Header from '../header/header';
import Meta from '../meta/meta';

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => {
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
  align-items: flex-start;
`;

export default Layout;
