import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import Scoreboard from '../components/Scoreboard';
import Post, { PostProps } from '../components/Post';
import prisma from '../lib/prisma';
import Team from '../components/team/team';
import styled from '@emotion/styled';
import Scoring from '../components/scoring/scoring';
import defaultPlayers from '../components/players';
import { useGameScore } from '../context/GameScoreContext';

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

type Player = {
  index: number;
  name: string;
  runs: number;
  isBatting: boolean;
  isOnTheCrease: boolean;
  isOut: boolean;
  allActions: (string | null)[];
};

type Props = {
  feed: PostProps[];
};

const Blog: React.FC<Props> = (props) => {
  const [team1Players, setTeam1Players] = useState<Player[]>(defaultPlayers());
  const [team2Players, setTeam2Players] = useState<Player[]>(defaultPlayers());
  const [currentStriker, setCurrentStriker] = useState<Player>(team1Players[0]);
  const [currentNonStriker, setCurrentNonStriker] = useState<Player>(team1Players[1]);

  const [mostRecentAction, setMostRecentAction] = useState<{
    runs: number;
    action: string | null;
  }>({
    runs: 0,
    action: null
  });

  const maxOvers = 20;
  const [currentOver, setCurrentOver] = useState(1);
  const [currentBallInOver, setCurrentBallInOver] = useState(1);
  const [currentExtrasInOver, setCurrentExtrasInOver] = useState(0);
  const maxBallsInOver = 6 + currentExtrasInOver;

  const updatePlayerRuns = (
    teamIndex: number,
    playerIndex: number,
    runs: number,
    action: null | string
  ): void => {
    if (teamIndex === 1) {
      const updatedPlayers = [...team1Players];
      updatedPlayers[playerIndex].runs += runs;
      if (action) {
        updatedPlayers[playerIndex].allActions.push(action);
      } else {
        updatedPlayers[playerIndex].allActions.push(runs.toString());
      }
      if (action === 'Wicket') {
        updatedPlayers[playerIndex].isOnTheCrease = false;
        updatedPlayers[playerIndex].isOut = true;
        const nextPlayer = updatedPlayers.find((player) => !player.isOut && !player.isOnTheCrease);
        if (nextPlayer) {
          updatedPlayers[nextPlayer.index].isOnTheCrease = true;
          setCurrentStriker(updatedPlayers[playerIndex + 1]);
        } else {
          console.log('all out');
        }
      }
      setTeam1Players(updatedPlayers);
    } else if (teamIndex === 2) {
      const updatedPlayers = [...team2Players];
      updatedPlayers[playerIndex].runs += runs;
      if (action) {
        updatedPlayers[playerIndex].allActions.push(action);
      } else {
        updatedPlayers[playerIndex].allActions.push(runs.toString());
      }
      if (action === 'Wicket') {
        updatedPlayers[playerIndex].isOnTheCrease = false;
        updatedPlayers[playerIndex].isOut = true;
        const nextPlayer = updatedPlayers.find((player) => !player.isOut && !player.isOnTheCrease);
        if (nextPlayer) {
          updatedPlayers[nextPlayer.index].isOnTheCrease = true;
          setCurrentStriker(updatedPlayers[playerIndex + 1]);
        } else {
          console.log('all out');
        }
      }
      setTeam2Players(updatedPlayers);
    }
  };

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
      const temp = currentStriker;
      setCurrentStriker(currentNonStriker);
      setCurrentNonStriker(temp);
    }
    if (currentOver === maxOvers) {
      console.log('game over');
    }
  };

  const { gameScore, setPlayerScore } = useGameScore();

  const updateGame = (
    teamIndex: number,
    playerIndex: number,
    runs: number,
    action: null | string
  ) => {
    setPlayerScore(teamIndex, playerIndex, runs);
    setMostRecentAction({ runs, action });
  };

  return (
    <Layout>
      <Main aria-label="Scoreboard">
        <Board>
          <Team
            teamIndex={1}
            name="Team 1"
            players={team1Players}
            teamScore={gameScore.team1Players}
            currentStriker={currentStriker}
            currentNonStriker={currentNonStriker}
            mostRecentAction={mostRecentAction}
          />
          <Scoreboard />
          <Scoring
            onScoreUpdate={updateGame}
            onOverUpdate={updateOvers}
            currentStriker={currentStriker}
          />
          <Team
            teamIndex={2}
            name="Team 2"
            players={team2Players}
            teamScore={gameScore.team2Players}
            currentStriker={currentStriker}
            currentNonStriker={currentNonStriker}
            mostRecentAction={mostRecentAction}
          />
        </Board>
        {/* <h2>Public Feed</h2>
        {props.feed.map((post) => (
          <div key={post.id} className="post">
            <Post post={post} />
          </div>
        ))} */}
      </Main>
    </Layout>
  );
};

export default Blog;

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
