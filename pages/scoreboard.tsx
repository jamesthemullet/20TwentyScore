import styled from "@emotion/styled";
import Link from "next/link";
import type React from "react";
import Layout from "../components/layout/layout";

const ScoreboardPage: React.FC = () => {
  return (
    <Layout
      title="Scoreboard"
      description="Full scoreboard for the current T20 cricket match."
    >
      <Main>
        <EmptyState>
          <PageTitle>Scoreboard</PageTitle>
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

const PageTitle = styled.h1`
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  font-size: 2rem;
  font-weight: 400;
  margin: 0;
  color: #1a1a1a;
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
