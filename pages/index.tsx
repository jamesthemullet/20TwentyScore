import React from 'react';
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
  return (
    <Layout>
      <Main aria-label="Scoreboard">
        <Board>
          <Team teamIndex={0} />
          <Scoreboard />
          <Scoring />
          <Team teamIndex={1} />
        </Board>
        <h2>Public Feed</h2>
        {props?.feed?.map((post) => (
          <div key={post.id} className="post">
            <Post post={post} />
          </div>
        ))}
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
  flex-direction: row;
  justify-content: space-between;
  min-height: 500px;
  gap: 10px;
  padding: 20px;
`;

const Main = styled.main`
  position: relative;
  width: 100%;
`;
