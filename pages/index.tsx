import React, { useState } from 'react';
import { GetStaticProps } from 'next/types';
import Layout from '../components/layout/layout';
import Scoreboard from '../components/scoreboard/scoreboard';
import { PostProps } from '../components/post/post';
import prisma from '../lib/prisma';
import Team from '../components/team/team';
import styled from '@emotion/styled';
import Scoring from '../components/scoring/scoring';
import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';

type Props = {
  feed: PostProps[];
};

const Index: React.FC<Props> = (props) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number | null>(null);

  const openModal = (index: number) => {
    setSelectedTeamIndex(index);
    open();
  };

  return (
    <Layout>
      <Main aria-label="Scoreboard">
        <Board>
          <Scoreboard handleShowTeam={(index) => openModal(index)} />
          <Scoring />
        </Board>
        {selectedTeamIndex !== null && (
          <Modal
            opened={opened}
            onClose={() => {
              close();
              setSelectedTeamIndex(null);
            }}
            size="800"
            withCloseButton={true}>
            <Team teamIndex={selectedTeamIndex} />
          </Modal>
        )}
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
  max-width: 2000px;
  margin: 0 auto;
  flex: 1;
`;
