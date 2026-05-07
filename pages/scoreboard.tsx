import React from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import Layout from '../components/layout/layout';

const ScoreboardPage: React.FC = () => {
  return (
    <Layout>
      <Main>
        <EmptyState>
          <p>Scoreboard coming soon.</p>
          <Link href="/">Go home</Link>
        </EmptyState>
      </Main>
    </Layout>
  );
};

export default ScoreboardPage;

const Main = styled.main`
  position: relative;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  flex: 1;
  justify-content: center;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;

  a {
    color: #333;
    font-weight: bold;
  }
`;
