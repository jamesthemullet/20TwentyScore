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
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <Meta title={title} description={description} />
      <Header />
      <BetaBanner role="region" aria-label="Beta notice">
        This site is new and may have rough edges. For suggestions or issues, email{' '}
        <a href="mailto:hello@20twentyscore.co.uk">hello@20twentyscore.co.uk</a>
      </BetaBanner>
      <Content id="main-content" tabIndex={-1}>{children}</Content>
      <Footer />
    </SiteContainer>
  );
};

const SkipLink = styled.a`
  position: absolute;
  top: -100%;
  left: 1rem;
  z-index: 9999;
  background: #1a1a1a;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0 0 4px 4px;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;

  &:focus {
    top: 0;
  }
`;

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
