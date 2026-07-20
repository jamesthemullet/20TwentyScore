import styled from "@emotion/styled";
import { useRouter } from "next/router";
import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PrimaryButton, SecondaryButton } from "../components/core/buttons";
import Layout from "../components/layout/layout";
import PitchDiagram from "../components/pitch/pitch-diagram";
import { useGameScore } from "../context/GameScoreContext";
import type { GameScore } from "../context/GameScoreContext";

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  import("accented").then(({ accented }) => {
    accented();
  });
}

const Index: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const { setGameScore } = useGameScore();

  const loadGame = (): void => {
    const gameData = localStorage.getItem("gameData");
    if (!gameData) {
      setError("No game data found");
      return;
    }
    try {
      const parsedGameData = JSON.parse(gameData);
      if (
        !Array.isArray(parsedGameData) ||
        parsedGameData.length !== 2 ||
        !parsedGameData.every((team) => Array.isArray(team?.players))
      ) {
        setError("Saved game data is corrupted");
        return;
      }
      setGameScore(parsedGameData as GameScore);
      router.push("/match");
    } catch {
      setError("Saved game data is corrupted");
    }
  };

  const newGame = (): void => {
    localStorage.removeItem("gameData");
    localStorage.removeItem("cloudSaveId");
    router.push("/setup");
  };

  return (
    <Layout
      description="Track your T20 cricket match ball by ball. Start a new game or resume a saved match."
    >
      <Main>
        <Welcome>Welcome to 20Twenty Score</Welcome>
        <HeroSection>
          <PitchDiagram />
          <HeroText>
            <Tagline>
              Twenty overs,
              <br />
              two teams,
              <br />
              one scoresheet.
            </Tagline>
            <Description>
              A hand-kept ledger for your Saturday-afternoon T20s — ball by
              ball, over by over, with a running tally any pavilion would be
              proud of.
            </Description>
            <FeatureList>
              <li>Ball-by-ball</li>
              <li>Run rates</li>
              <li>Player figures</li>
            </FeatureList>
          </HeroText>
        </HeroSection>
        <ButtonsContainer>
          <PrimaryButton onClick={() => newGame()}>
            Start New Match
          </PrimaryButton>
          <SecondaryButton onClick={() => loadGame()}>
            Resume Saved Match
          </SecondaryButton>
          {session && (
            <DashboardLink href="/dashboard">Dashboard</DashboardLink>
          )}
        </ButtonsContainer>
        {error && <p role="alert">{error}</p>}
      </Main>
    </Layout>
  );
};

export default Index;

const Main = styled.main`
  position: relative;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  flex: 1;
  justify-content: center;
`;

const DashboardLink = styled(Link)`
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.6rem 1.5rem;
  border-radius: 999px;
  border: 2px solid #333;
  background-color: transparent;
  color: #333;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  margin-top: 1rem;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    button {
      font-size: 0.7rem;
      padding: 0.45rem 1rem;
    }
  }
`;

const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem 1rem 0;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
`;

const HeroText = styled.div`
  text-align: center;
  max-width: 420px;

  @media (min-width: 640px) {
    text-align: left;
  }
`;

const Welcome = styled.h1`
  font-family: "Bodoni Moda", serif;
  font-size: 2.5rem;
  color: #222;
  margin: 0;
  padding: 1.5rem 1rem 0;
  text-align: center;
  width: 100%;

  @media (min-width: 640px) {
    font-size: 3.25rem;
  }
`;

const Tagline = styled.p`
  font-family: "Bodoni Moda", serif;
  font-size: 2.75rem;
  font-weight: 700;
  color: #222;
  line-height: 1.4;
  margin: 0 0 1.25rem;
`;

const Description = styled.p`
  font-size: 1rem;
  color: #555;
  line-height: 1.7;
  margin: 0 0 1.5rem;
  font-family: Georgia, serif;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;

  @media (min-width: 640px) {
    justify-content: flex-start;
  }

  li {
    font-family: "Inter", sans-serif;
    font-size: 0.85rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #666;

    &::before {
      content: "";
      display: inline-block;
      width: 14px;
      height: 14px;
      background-image: url("/icons/png/001-cricket.png");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      margin-right: 0.5rem;
      vertical-align: middle;
    }
  }
`;
