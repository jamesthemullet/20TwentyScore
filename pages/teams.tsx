import styled from '@emotion/styled';
import type React from 'react';
import Layout from '../components/layout/layout';
import { useGameScore } from '../context/GameScoreContext';
import type { Team, TeamPlayer } from '../context/GameContext';

const TEAM_COLORS = ['#b83320', '#2d7a4f'] as const;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatScore(team: Team): string {
  const overs = team.overs.toFixed(1);
  return `${team.totalRuns}/${team.totalWicketsConceded} (${overs})`;
}

function getStatusBadge(player: TeamPlayer, teamIndex: number, battingTeamIndex: number) {
  const isBattingTeam = teamIndex === battingTeamIndex;
  if (isBattingTeam && player.currentStriker) return 'STRIKE';
  if (isBattingTeam && player.currentNonStriker) return 'NON';
  if (player.currentBowler) return 'BOWLING';
  return null;
}

const TeamsPage: React.FC = () => {
  const { gameScore } = useGameScore();

  const battingTeam = gameScore.find((t) => t.currentBattingTeam);
  const battingTeamIndex = battingTeam?.index ?? 0;

  return (
    <Layout>
      <PageWrapper>
        <PageHeader>
          <PageTitleGroup>
            <PageNumber>No. III</PageNumber>
            <PageTitle>The two XIs</PageTitle>
            <TitleRule />
          </PageTitleGroup>
          <SquadsLabel>SQUADS</SquadsLabel>
        </PageHeader>

        <TeamsGrid>
          {gameScore.map((team) => (
            <TeamPanel key={team.index}>
              <TeamHeader>
                <TeamHeaderLeft>
                  <InitialsBadge color={TEAM_COLORS[team.index]}>
                    {getInitials(team.name)}
                  </InitialsBadge>
                  <TeamName>{team.name}</TeamName>
                </TeamHeaderLeft>
                <TeamScore>{formatScore(team)}</TeamScore>
              </TeamHeader>

              <PanelDivider />

              <PlayerList>
                {team.players.map((player, i) => {
                  const badge = getStatusBadge(player, team.index, battingTeamIndex);
                  return (
                    <PlayerRow key={player.index}>
                      <PlayerLeft>
                        <PlayerNumber>{i + 1}.</PlayerNumber>
                        <PlayerName>{player.name}</PlayerName>
                        {badge && <StatusBadge badge={badge}>{badge}</StatusBadge>}
                      </PlayerLeft>
                      <PlayerStats>
                        <StatCol>
                          <StatValue>{player.runs}</StatValue>
                          <StatLabel>RUNS</StatLabel>
                        </StatCol>
                        <StatCol>
                          <StatValue>{player.allActions.length}</StatValue>
                          <StatLabel>BALLS</StatLabel>
                        </StatCol>
                        <StatCol>
                          <StatValue>{player.wicketsTaken}</StatValue>
                          <StatLabel>WKTS</StatLabel>
                        </StatCol>
                      </PlayerStats>
                    </PlayerRow>
                  );
                })}
              </PlayerList>
            </TeamPanel>
          ))}
        </TeamsGrid>
      </PageWrapper>
    </Layout>
  );
};

export default TeamsPage;

const PageWrapper = styled.main`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PageTitleGroup = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex: 1;
`;

const PageNumber = styled.span`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  color: #b83320;
  font-size: 1.25rem;
  white-space: nowrap;
`;

const PageTitle = styled.h1`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 1.75rem;
  font-weight: 400;
  margin: 0;
  color: #1a1a1a;
  white-space: nowrap;
`;

const TitleRule = styled.hr`
  flex: 1;
  border: none;
  border-top: 1px solid #1a1a1a;
  margin: 0;
`;

const SquadsLabel = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  color: #767676;
  white-space: nowrap;
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

const TeamHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const TeamHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const InitialsBadge = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TeamName = styled.h2`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0;
  color: #1a1a1a;
`;

const TeamScore = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  color: #1a1a1a;
`;

const PanelDivider = styled.hr`
  border: none;
  border-top: 1px dashed #888;
  margin: 0 0 0.25rem;
`;

const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
`;

const PlayerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0;
  border-bottom: 1px dashed #ccc;

  &:last-child {
    border-bottom: none;
  }
`;

const PlayerLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
`;

const PlayerNumber = styled.span`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 0.85rem;
  color: #767676;
  width: 1.5rem;
  flex-shrink: 0;
`;

const PlayerName = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #1a1a1a;
`;

const StatusBadge = styled.span<{ badge: 'STRIKE' | 'NON' | 'BOWLING' }>`
  font-family: 'Inter', sans-serif;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 2px 6px;
  border-radius: 3px;
  color: #fff;
  background-color: ${({ badge }) => {
    if (badge === 'STRIKE') return '#b83320';
    if (badge === 'BOWLING') return '#2d7a4f';
    return '#555';
  }};
`;

const PlayerStats = styled.div`
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
`;

const StatCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 2rem;
`;

const StatValue = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  font-weight: 700;
  color: #1a1a1a;
`;

const StatLabel = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.55rem;
  letter-spacing: 0.1em;
  color: #767676;
  text-transform: uppercase;
`;
