import React, { useState } from 'react';
import Layout from '../components/layout/layout';
import Scoreboard from '../components/scoreboard/scoreboard';
import { PostProps } from '../components/post/post';
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
  const [error, setError] = useState<string | null>(null);

  const { setGameScore, gameScore, setCurrentBowler } = useGameScore();

  console.log(20, gameScore);

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
    } else {
      setError('No game data found');
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
    setSelectBowler(true);
  };

  const settingBowler = (teamIndex: number, playerIndex: number) => {
    setCurrentBowler(teamIndex, playerIndex);
    setSelectBowler(false);
    setGameInitialised(true);
  };

  const handleSelectBowler = () => {
    setSelectBowler(true);
  };

  return (
    <Layout>
      <Main aria-label="Scoreboard">
        {gameInitialised && !selectBowler && (
          <Board>
            <Scoreboard handleShowTeam={(index) => openModal(index)} />
            <Scoring setSelectBowler={handleSelectBowler} />
          </Board>
        )}
        {gameInitialised && selectBowler && (
          <StartingBox>
            {!selectBowler && (
              <ButtonsContainer>
                <PrimaryButton onClick={() => newGame()}>New Game</PrimaryButton>
                <PrimaryButton onClick={() => loadGame()}>Load Game</PrimaryButton>
              </ButtonsContainer>
            )}
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
            {error && <p>{error}</p>}
          </StartingBox>
        )}
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
        {!gameInitialised && (
          <StartingBox>
            {!selectBowler && (
              <ButtonsContainer>
                <PrimaryButton onClick={() => newGame()}>New Game</PrimaryButton>
                <PrimaryButton onClick={() => loadGame()}>Load Game</PrimaryButton>
              </ButtonsContainer>
            )}
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
            {error && <p>{error}</p>}
          </StartingBox>
        )}
      </Main>
    </Layout>
  );
};

export default Index;

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
  justify-content: center;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
`;

const StartingBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
`;
