import styled from '@emotion/styled';
import type React from 'react';
import type { ReactNode } from 'react';
import Footer from '../footer/footer';
import Header from '../header/header';
import Meta from '../meta/meta';

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
};

const Layout: React.FC<Props> = ({ children, title, description }) => {
  return (
    <SiteContainer>
      <Meta title={title} description={description} />
      <Header />
      <BetaBanner role="region" aria-label="Beta notice">
        This site is new and may have rough edges. For suggestions or issues, email{' '}
        <a href="mailto:hello@20twentyscore.co.uk">hello@20twentyscore.co.uk</a>
      </BetaBanner>
      <Content>{children}</Content>
      <Footer />
    </SiteContainer>
  );
};

const SiteContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const BetaBanner = styled.div`
  background-color: #f5a623;
  color: #333;
  text-align: center;
  padding: 0.5rem 1rem;
  font-size: 1rem;

  a {
    color: #333;
    font-weight: bold;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

export default Layout;
