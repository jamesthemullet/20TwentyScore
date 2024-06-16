import React, { useState } from 'react';
import { GetStaticProps } from 'next/types';
import Layout from '../components/layout/layout';
import Scoreboard from '../components/scoreboard/scoreboard';
import Post, { PostProps } from '../components/post/post';
import prisma from '../lib/prisma';
import Team from '../components/team/team';
import styled from '@emotion/styled';
import Scoring from '../components/scoring/scoring';

type Props = {
  feed: PostProps[];
};

const Index: React.FC<Props> = (props) => {
  const [showTeam0, setShowTeam0] = useState(false);
  const [showTeam1, setShowTeam1] = useState(false);
  const showTeamDisplay = (index: number) => {
    if (index === 0) {
      setShowTeam0(!showTeam0);
    } else {
      setShowTeam1(!showTeam1);
    }
  };
  return (
    <Layout>
      <Main aria-label="Scoreboard">
        <Board>
          <TeamContainer showTeam={showTeam0} index={0}>
            <Team teamIndex={0} />
          </TeamContainer>
          <Scoreboard handleShowTeam={(index) => showTeamDisplay(index)} />
          <Scoring />
          <TeamContainer showTeam={showTeam1} index={1}>
            <Team teamIndex={1} />
          </TeamContainer>
        </Board>
      </Main>
    </Layout>
  );
};

export default Index;

export const getStaticProps: GetStaticProps = async () => {
  const feed = await prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: { name: true }
      }
    }
  });
  return {
    props: { feed },
    revalidate: 10
  };
};

const Board = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  padding: 20px;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const Main = styled.main`
  position: relative;
  width: 100%;
`;

const TeamContainer = styled.div<{ showTeam: boolean; index: number }>`
  display: ${(props) => (props.showTeam ? 'block' : 'none')};
  transition: transform 0.3s ease-in-out, opacity 0.3s, flex 0.3s;
  transform: translateX(
    ${(props) => (props.showTeam ? '0' : props.index === 0 ? '-100%' : '100%')}
  );
  opacity: ${(props) => (props.showTeam ? '1' : '0')};
  flex: ${(props) => (props.showTeam ? '10' : '0')};
  order: 1;

  @media (min-width: 768px) {
    display: block;
    order: ${(props) => (props.index === 0 ? 1 : 3)};
  }
`;
