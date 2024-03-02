import React, { useState } from 'react';
import { GetStaticProps } from 'next/types';
import Layout from '../components/layout/layout';
import Scoreboard from '../components/scoreboard/scoreboard';
import Post, { PostProps } from '../components/Post';
import prisma from '../lib/prisma';
import Team from '../components/team/team';
import styled from '@emotion/styled';
import Scoring from '../components/scoring/scoring';
import { useGameScore } from '../context/GameScoreContext';
import { useMostRecentAction } from '../context/MostRecentActionContext';

type Props = {
  feed: PostProps[];
};

const Index: React.FC<Props> = (props) => {
  const maxOvers = 20;
  const [currentOver, setCurrentOver] = useState(1);
  const [currentBallInOver, setCurrentBallInOver] = useState(1);
  const [currentExtrasInOver, setCurrentExtrasInOver] = useState(0);
  const maxBallsInOver = 6 + currentExtrasInOver;

  // const updatePlayerRuns = (
  //   teamIndex: number,
  //   playerIndex: number,
  //   runs: number,
  //   action: null | string
  // ): void => {
  //   if (teamIndex === 1) {
  //     const updatedPlayers = [...team1Players];
  //     updatedPlayers[playerIndex].runs += runs;
  //     if (action) {
  //       updatedPlayers[playerIndex].allActions.push(action);
  //     } else {
  //       updatedPlayers[playerIndex].allActions.push(runs.toString());
  //     }
  //     if (action === 'Wicket') {
  //       updatedPlayers[playerIndex].isOnTheCrease = false;
  //       updatedPlayers[playerIndex].isOut = true;
  //       const nextPlayer = updatedPlayers.find((player) => !player.isOut && !player.isOnTheCrease);
  //       if (nextPlayer) {
  //         updatedPlayers[nextPlayer.index].isOnTheCrease = true;
  //         setCurrentStriker(updatedPlayers[playerIndex + 1]);
  //       } else {
  //         console.log('all out');
  //       }
  //     }
  //     setTeam1Players(updatedPlayers);
  //   } else if (teamIndex === 2) {
  //     const updatedPlayers = [...team2Players];
  //     updatedPlayers[playerIndex].runs += runs;
  //     if (action) {
  //       updatedPlayers[playerIndex].allActions.push(action);
  //     } else {
  //       updatedPlayers[playerIndex].allActions.push(runs.toString());
  //     }
  //     if (action === 'Wicket') {
  //       updatedPlayers[playerIndex].isOnTheCrease = false;
  //       updatedPlayers[playerIndex].isOut = true;
  //       const nextPlayer = updatedPlayers.find((player) => !player.isOut && !player.isOnTheCrease);
  //       if (nextPlayer) {
  //         updatedPlayers[nextPlayer.index].isOnTheCrease = true;
  //         setCurrentStriker(updatedPlayers[playerIndex + 1]);
  //       } else {
  //         console.log('all out');
  //       }
  //     }
  //     setTeam2Players(updatedPlayers);
  //   }
  // };

  const updateOvers = (action: null | string) => {
    if (action === 'No Ball' || action === 'Wide') {
      setCurrentExtrasInOver(currentExtrasInOver + 1);
    }
    if (currentBallInOver < maxBallsInOver) {
      setCurrentBallInOver(currentBallInOver + 1);
    } else {
      setCurrentBallInOver(1);
      setCurrentExtrasInOver(0);
      setCurrentOver(currentOver + 1);
      //swap currentStriker with currentNonStriker
      // const temp = currentStriker;
      // setCurrentStriker(currentNonStriker);
      // setCurrentNonStriker(temp);
    }
    if (currentOver === maxOvers) {
      console.log('game over');
    }
  };

  const { setMostRecentAction } = useMostRecentAction();
  const { setPlayerScore } = useGameScore();

  const updateGame = (
    teamIndex: number,
    playerIndex: number,
    runs: number,
    action: null | string
  ) => {
    setPlayerScore(teamIndex, playerIndex, runs, action);
    setMostRecentAction({ runs, action });
  };

  return (
    <Layout>
      <Main aria-label="Scoreboard">
        <Board>
          <Team teamIndex={0} />
          <Scoreboard />
          <Scoring onScoreUpdate={updateGame} onOverUpdate={updateOvers} />
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
