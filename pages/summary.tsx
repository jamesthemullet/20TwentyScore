import styled from '@emotion/styled';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/layout/layout';
import { useGameScore } from '../context/GameScoreContext';
import type { Team } from '../context/GameContext';
import { generateSaveTitle } from '../lib/gameSaveTitle';

const TEAM_COLORS = ['#b83320', '#2d7a4f'] as const;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function calcRunRate(runs: number, overs: number): string {
  if (overs === 0) return '0.00';
  return (runs / overs).toFixed(2);
}

function determineResult(teams: [Team, Team]): string | null {
  const [t0, t1] = teams;
  if (!t0.finishedBatting && !t1.finishedBatting) return null;
  if (t0.finishedBatting && t1.finishedBatting) {
    if (t0.totalRuns > t1.totalRuns) return `${t0.name} win`;
    if (t1.totalRuns > t0.totalRuns) return `${t1.name} win`;
    return 'Match drawn';
  }
  return null;
}

const SummaryPage: React.FC = () => {
  const { gameScore } = useGameScore();
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const battingTeam = gameScore.find((t) => t.currentBattingTeam) ?? gameScore[0];
  const bowlingTeam = gameScore.find((t) => t.currentBowlingTeam) ?? gameScore[1];
  const result = determineResult(gameScore as [Team, Team]);

  const saveToCloud = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const cloudSaveId = localStorage.getItem('cloudSaveId');
    const title = generateSaveTitle(gameScore);
    const completed = Boolean(result);

    try {
      let res: Response;
      if (cloudSaveId) {
        res = await fetch(`/api/saves/${cloudSaveId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameData: gameScore, title, completed }),
        });
      } else {
        res = await fetch('/api/saves', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameData: gameScore, title, completed }),
        });
      }

      if (res.status === 402) {
        setSaveError('FREE_LIMIT_REACHED');
        return;
      }
      if (!res.ok) {
        setSaveError('Something went wrong. Please try again.');
        return;
      }

      const saved = await res.json() as { id: string };
      if (!cloudSaveId) localStorage.setItem('cloudSaveId', saved.id);
      setSaveSuccess(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <PageWrapper>
        <PageHeader>
          <PageTitleGroup>
            <PageNumber>No. IV</PageNumber>
            <PageTitle>Match summary</PageTitle>
            <TitleRule />
          </PageTitleGroup>
          <ScorecardLabel>SCORECARD</ScorecardLabel>
        </PageHeader>

        <ScorePanel>
          <TeamSide>
            <TeamMeta>
              <InitialsBadge color={TEAM_COLORS[battingTeam.index]} outlined={false}>
                {getInitials(battingTeam.name)}
              </InitialsBadge>
              <RoleLabel>BATTING</RoleLabel>
            </TeamMeta>
            <TeamName>{battingTeam.name}</TeamName>
            <ScoreRow>
              <Runs>{battingTeam.totalRuns}</Runs>
              <Wickets>/{battingTeam.totalWicketsConceded}</Wickets>
            </ScoreRow>
            <OversRow>
              OVERS <strong>{battingTeam.overs.toFixed(1)}</strong>
              {'  '}RR <strong>{calcRunRate(battingTeam.totalRuns, battingTeam.overs)}</strong>
            </OversRow>
          </TeamSide>

          <MatchCentre>
            <BallIcon src="/icons/png/006-cricket-1.png" alt="cricket ball" />
            <Vs>vs</Vs>
            <Format>T20 · 20 Overs</Format>
          </MatchCentre>

          <TeamSide align="right" muted>
            <TeamMeta reverse>
              <RoleLabel>BOWLING</RoleLabel>
              <InitialsBadge color={TEAM_COLORS[bowlingTeam.index]} outlined>
                {getInitials(bowlingTeam.name)}
              </InitialsBadge>
            </TeamMeta>
            <TeamName muted>{bowlingTeam.name}</TeamName>
            <ScoreRow>
              <Runs muted>{bowlingTeam.totalRuns}</Runs>
              <Wickets muted>/{bowlingTeam.totalWicketsConceded}</Wickets>
            </ScoreRow>
            <OversRow>
              OVERS <strong>{bowlingTeam.overs.toFixed(1)}</strong>
              {'  '}RR <strong>{calcRunRate(bowlingTeam.totalRuns, bowlingTeam.overs)}</strong>
            </OversRow>
          </TeamSide>
        </ScorePanel>

        <ResultPanel>
          {result ? (
            <>
              <ResultHeading>{result}</ResultHeading>
              <ResultBody>
                Tap <Link href="/match">Match</Link> to keep scoring, or start a fresh innings from{' '}
                <Link href="/">Home</Link>.
              </ResultBody>
            </>
          ) : (
            <>
              <ResultHeading>Match in progress</ResultHeading>
              <ResultBody>
                Head to <Link href="/match">Match</Link> to keep scoring.
              </ResultBody>
            </>
          )}

          {session && (
            <CloudSaveSection>
              <CloudSaveButton onClick={saveToCloud} disabled={saving}>
                {saving ? 'Saving…' : localStorage.getItem('cloudSaveId') ? 'Update cloud save' : 'Save to cloud'}
              </CloudSaveButton>
              {saveError === 'FREE_LIMIT_REACHED' && (
                <UpgradePrompt>
                  You&apos;ve reached the free save limit.{' '}
                  <Link href="/account">Upgrade to Premium</Link> for unlimited saves.
                </UpgradePrompt>
              )}
              {saveError && saveError !== 'FREE_LIMIT_REACHED' && (
                <SaveMessage error role="alert">{saveError}</SaveMessage>
              )}
              {saveSuccess && <SaveMessage>Saved to cloud!</SaveMessage>}
            </CloudSaveSection>
          )}
        </ResultPanel>
      </PageWrapper>
    </Layout>
  );
};

export default SummaryPage;

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

const ScorecardLabel = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  color: #767676;
  white-space: nowrap;
`;

const ScorePanel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid #1a1a1a;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
`;

const TeamSide = styled.div<{ align?: string; muted?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  align-items: ${({ align }) => (align === 'right' ? 'flex-end' : 'flex-start')};
`;

const TeamMeta = styled.div<{ reverse?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-direction: ${({ reverse }) => (reverse ? 'row-reverse' : 'row')};
`;

const InitialsBadge = styled.div<{ color: string; outlined: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  flex-shrink: 0;
  background-color: ${({ outlined, color }) => (outlined ? 'transparent' : color)};
  border: 2px solid ${({ color }) => color};
  color: ${({ outlined, color }) => (outlined ? color : '#fff')};
`;

const RoleLabel = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #767676;
`;

const TeamName = styled.p<{ muted?: boolean }>`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 1.75rem;
  font-weight: 400;
  color: ${({ muted }) => (muted ? '#aaa' : '#1a1a1a')};
  margin: 0;
`;

const ScoreRow = styled.div`
  display: flex;
  align-items: baseline;
  line-height: 1;
`;

const Runs = styled.span<{ muted?: boolean }>`
  font-family: 'JetBrains Mono', monospace;
  font-size: 5rem;
  font-weight: 700;
  color: ${({ muted }) => (muted ? '#ccc' : '#1a1a1a')};
`;

const Wickets = styled.span<{ muted?: boolean }>`
  font-family: 'JetBrains Mono', monospace;
  font-size: 2rem;
  font-weight: 700;
  color: ${({ muted }) => (muted ? '#ccc' : '#1a1a1a')};
`;

const OversRow = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #767676;
  margin: 0.25rem 0 0;

  strong {
    font-family: 'JetBrains Mono', monospace;
    color: #1a1a1a;
  }
`;

const MatchCentre = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  margin: 0 2rem;
`;

const BallIcon = styled.img`
  width: 56px;
  height: 56px;
  object-fit: contain;
`;

const Vs = styled.p`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 1.5rem;
  color: #1a1a1a;
  margin: 0;
`;

const Format = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #767676;
  margin: 0;
  white-space: nowrap;
`;

const ResultPanel = styled.div`
  border: 2px solid #1a1a1a;
  border-radius: 12px;
  padding: 1.5rem 2rem;
`;

const ResultHeading = styled.h2`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 1.5rem;
  font-weight: 400;
  color: #1a1a1a;
  margin: 0 0 0.5rem;
`;

const CloudSaveSection = styled.div`
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CloudSaveButton = styled.button`
  align-self: flex-start;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  border: 2px solid #333;
  background-color: #fff;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #f0f0f0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UpgradePrompt = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  background-color: #fff8e1;
  border: 1px solid #e8a020;
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  color: #1a1a1a;

  a {
    color: #b83320;
    font-weight: 700;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

const SaveMessage = styled.p<{ error?: boolean }>`
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: ${({ error }) => (error ? '#b83320' : '#2d7a4f')};
  font-weight: 700;
  margin: 0;
`;

const ResultBody = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #1a1a1a;
  margin: 0;

  a {
    color: #1a1a1a;
    font-weight: 700;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;
