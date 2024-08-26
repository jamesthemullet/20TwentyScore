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
import { PrimaryButton } from '../components/core/buttons';
import { useGameScore } from '../context/GameScoreContext';
import defaultPlayers from '../components/core/players';

type Props = {
  feed: PostProps[];
};

const Index: React.FC<Props> = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number | null>(null);
  const [gameInitialised, setGameInitialised] = useState(false);
  const [selectBowler, setSelectBowler] = useState(false);

  const { setGameScore, gameScore, setCurrentBowler } = useGameScore();

  const team1 = gameScore.find((team) => team.index === 1);

  const openModal = (index: number) => {
    setSelectedTeamIndex(index);
    open();
  };

  const loadGame = () => {
    const gameData = localStorage.getItem('gameData');
    if (gameData) {
      const parsedGameData = JSON.parse(gameData);
      setGameScore(parsedGameData);
      setGameInitialised(true);
    }
  };

  const newGame = () => {
    localStorage.removeItem('gameData');
    setGameScore([
      {
        players: defaultPlayers(),
        name: 'Team 1',
        index: 0,
        totalRuns: 0,
        totalWicketsConceded: 0,
        totalWicketsTaken: 0,
        overs: 0,
        currentBattingTeam: true,
        currentBowlingTeam: false,
        finishedBatting: false
      },
      {
        players: defaultPlayers(),
        name: 'Team 2',
        index: 1,
        totalRuns: 0,
        totalWicketsConceded: 0,
        totalWicketsTaken: 0,
        overs: 0,
        currentBattingTeam: false,
        currentBowlingTeam: true,
        finishedBatting: false
      }
    ]);
    setGameInitialised(true);
    setSelectBowler(true);
  };

  const settingBowler = (teamIndex: number, playerIndex: number) => {
    setCurrentBowler(teamIndex, playerIndex);
    setSelectBowler(false);
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
            withCloseButton={true}
            closeOnEscape={false}>
            <Team teamIndex={selectedTeamIndex} />
          </Modal>
        )}
        {(!gameInitialised || selectBowler) && (
          <div>
            <ButtonsContainer>
              <PrimaryButton onClick={() => newGame()}>New Game</PrimaryButton>
              <PrimaryButton onClick={() => loadGame()}>Load Game</PrimaryButton>
            </ButtonsContainer>
            {selectBowler && (
              <>
                <h3>Select the bowler for the first over.</h3>
                {team1?.players.map((player) => (
                  <PrimaryButton
                    key={player.name}
                    onClick={() => settingBowler(team1.index, player.index)}>
                    {player.name}
                  </PrimaryButton>
                ))}
              </>
            )}
          </div>
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

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
`;

const StyledModal = styled(Modal)`
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  h2 {
    text-align: center;
    margin-bottom: 30px;
    width: 100%;
    font-size: 1.5rem;
    font-weight: 600;
  }

  h3 {
    text-align: center;
    margin-top: 30px;
  }
`;
