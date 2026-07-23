import styled from "@emotion/styled";
import { useRouter } from "next/router";
import type React from "react";
import { useState } from "react";
import { PrimaryButton } from "../components/core/buttons";
import Layout from "../components/layout/layout";
import { makeInitialTeams, useGameScore } from "../context/GameScoreContext";

const TEAM_COLORS = ["#b83320", "#2d7a4f"] as const;
const PLAYERS_PER_TEAM = 11;

type TeamFormState = {
  name: string;
  playerNames: string[];
};

const emptyTeam = (): TeamFormState => ({
  name: "",
  playerNames: Array(PLAYERS_PER_TEAM).fill(""),
});

const NAME_LIST_SEPARATOR = /[,;\n\r\t]+/;

const parseNameList = (text: string): string[] =>
  text
    .split(NAME_LIST_SEPARATOR)
    .map((name) => name.trim())
    .filter(Boolean);

const SetupPage: React.FC = () => {
  const router = useRouter();
  const { setGameScore } = useGameScore();
  const [teams, setTeams] = useState<[TeamFormState, TeamFormState]>([
    emptyTeam(),
    emptyTeam(),
  ]);

  const updateTeamName = (teamIndex: 0 | 1, name: string) => {
    setTeams((prev) => {
      const next = [...prev] as [TeamFormState, TeamFormState];
      next[teamIndex] = { ...next[teamIndex], name };
      return next;
    });
  };

  const updatePlayerName = (teamIndex: 0 | 1, playerIndex: number, name: string) => {
    setTeams((prev) => {
      const next = [...prev] as [TeamFormState, TeamFormState];
      const playerNames = [...next[teamIndex].playerNames];
      playerNames[playerIndex] = name;
      next[teamIndex] = { ...next[teamIndex], playerNames };
      return next;
    });
  };

  const pasteTeamRoster = (teamIndex: 0 | 1, e: React.ClipboardEvent<HTMLInputElement>) => {
    const names = parseNameList(e.clipboardData.getData("text"));
    if (names.length <= 1) return;

    e.preventDefault();
    const [name, ...playerNames] = names;
    setTeams((prev) => {
      const next = [...prev] as [TeamFormState, TeamFormState];
      const nextPlayerNames = [...next[teamIndex].playerNames];
      playerNames.forEach((playerName, index) => {
        if (index < PLAYERS_PER_TEAM) nextPlayerNames[index] = playerName;
      });
      next[teamIndex] = { name, playerNames: nextPlayerNames };
      return next;
    });
  };

  const pastePlayerNames = (
    teamIndex: 0 | 1,
    playerIndex: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    const names = parseNameList(e.clipboardData.getData("text"));
    if (names.length <= 1) return;

    e.preventDefault();
    setTeams((prev) => {
      const next = [...prev] as [TeamFormState, TeamFormState];
      const playerNames = [...next[teamIndex].playerNames];
      names.forEach((name, offset) => {
        const index = playerIndex + offset;
        if (index < PLAYERS_PER_TEAM) playerNames[index] = name;
      });
      next[teamIndex] = { ...next[teamIndex], playerNames };
      return next;
    });
  };

  const startMatch = () => {
    setGameScore(
      makeInitialTeams(
        { name: teams[0].name, playerNames: teams[0].playerNames },
        { name: teams[1].name, playerNames: teams[1].playerNames }
      )
    );
    router.push("/match");
  };

  return (
    <Layout
      title="Match Setup"
      description="Enter team and player names before starting your T20 match."
    >
      <PageWrapper>
        <PageHeader>
          <PageTitle>Match setup</PageTitle>
        </PageHeader>

        <TeamsGrid>
          {teams.map((team, teamIndex) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: team slot (0/1) is a stable identity
            <TeamPanel key={`team-${teamIndex}`}>
              <TeamNameInput
                aria-label={`Team ${teamIndex + 1} name`}
                placeholder={`Team ${teamIndex + 1}`}
                value={team.name}
                color={TEAM_COLORS[teamIndex]}
                onChange={(e) => updateTeamName(teamIndex as 0 | 1, e.target.value)}
                onPaste={(e) => pasteTeamRoster(teamIndex as 0 | 1, e)}
              />
              <PlayerList>
                {team.playerNames.map((playerName, playerIndex) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: batting-order slot is a stable identity
                  <PlayerRow key={`team-${teamIndex}-player-${playerIndex}`}>
                    <PlayerNumber>{playerIndex + 1}.</PlayerNumber>
                    <PlayerNameInput
                      aria-label={`Team ${teamIndex + 1} player ${playerIndex + 1} name`}
                      placeholder={`Player ${playerIndex + 1}`}
                      value={playerName}
                      onChange={(e) =>
                        updatePlayerName(teamIndex as 0 | 1, playerIndex, e.target.value)
                      }
                      onPaste={(e) => pastePlayerNames(teamIndex as 0 | 1, playerIndex, e)}
                    />
                  </PlayerRow>
                ))}
              </PlayerList>
              <PasteHint>Tip: paste a comma or line-separated list to fill several names at once</PasteHint>
            </TeamPanel>
          ))}
        </TeamsGrid>

        <ButtonsContainer>
          <PrimaryButton type="button" onClick={startMatch}>
            Start Match
          </PrimaryButton>
        </ButtonsContainer>
      </PageWrapper>
    </Layout>
  );
};

export default SetupPage;

const PageWrapper = styled.main`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  font-size: 1.75rem;
  font-weight: 400;
  margin: 0;
  color: #1a1a1a;
`;

const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TeamPanel = styled.div`
  border: 2px solid #1a1a1a;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
`;

const TeamNameInput = styled.input<{ color: string }>`
  width: 100%;
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  font-size: 1.5rem;
  font-weight: 400;
  color: #1a1a1a;
  border: none;
  border-bottom: 2px solid ${({ color }) => color};
  padding: 0.25rem 0;
  margin-bottom: 1rem;
  background: transparent;

  &:focus {
    outline: 2px solid #005fcc;
    outline-offset: 2px;
  }
`;

const PlayerList = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const PlayerRow = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0;
  border-bottom: 1px dashed #ccc;

  &:last-child {
    border-bottom: none;
  }
`;

const PlayerNumber = styled.span`
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  font-size: 0.85rem;
  color: #767676;
  width: 1.5rem;
  flex-shrink: 0;
`;

const PlayerNameInput = styled.input`
  flex: 1;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  color: #1a1a1a;
  border: none;
  border-bottom: 1px solid transparent;
  padding: 0.25rem 0;
  background: transparent;

  &:focus {
    outline: 2px solid #005fcc;
    outline-offset: 2px;
    border-bottom: 1px solid #1a1a1a;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const PasteHint = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.75rem;
  color: #767676;
  margin: 0.75rem 0 0;
`;
