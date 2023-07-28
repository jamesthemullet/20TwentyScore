import React, { ReactNode } from 'react';
import Header from './Header';
import styled from 'styled-components';
import Footer from './Footer';

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => {
  return (
    <Page>
      <Header />
      <div className="layout">{props.children}</div>
      <Footer />
    </Page>
  );
};

export default Layout;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
`;
