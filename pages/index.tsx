import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import Scoreboard from '../components/Scoreboard';
import Post, { PostProps } from '../components/Post';
import prisma from '../lib/prisma';
import Team from '../components/Team';
import styled from 'styled-components';
import Scoring from '../components/scoring';
import defaultPlayers from '../components/players';

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
  name: string;
  runs: number;
  isBatting: boolean;
  allActions: string[];
};

type Props = {
  feed: PostProps[];
};

const Blog: React.FC<Props> = (props) => {
  const [team1Players, setTeam1Players] = useState<Player[]>(defaultPlayers());

  const [team2Players, setTeam2Players] = useState<Player[]>(defaultPlayers());

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
      setTeam1Players(updatedPlayers);
    } else if (teamIndex === 2) {
      const updatedPlayers = [...team2Players];
      updatedPlayers[playerIndex].runs += runs;
      if (action) {
        updatedPlayers[playerIndex].allActions.push(action);
      } else {
        updatedPlayers[playerIndex].allActions.push(runs.toString());
      }
      setTeam2Players(updatedPlayers);
    }
  };
  return (
    <Layout>
      <div className="page">
        <main>
          <Board>
            <Team name="Team 1" players={team1Players} />
            <Scoreboard />
            <Scoring onScoreUpdate={updatePlayerRuns} />
            <Team name="Team 2" players={team2Players} />
          </Board>
          <h2>Public Feed</h2>
          {props.feed.map((post) => (
            <div key={post.id} className="post">
              <Post post={post} />
            </div>
          ))}
        </main>
      </div>
    </Layout>
  );
};

export default Blog;

const Board = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
