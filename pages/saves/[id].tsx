import styled from '@emotion/styled';
import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import type React from 'react';
import Layout from '../../components/layout/layout';
import Scorecard from '../../components/scorecard/scorecard';
import { authOptions } from '../../lib/authOptions';
import { prisma } from '../../lib/prisma';
import type { GameScore } from '../../context/GameContext';
import { hasBatted } from '../../utils/scorecardStats';

type SaveDetail = {
  id: string;
  title: string | null;
  createdAt: string;
  completed: boolean;
  gameScore: GameScore | null;
};

type PageProps = {
  save: SaveDetail;
};

function isGameScore(value: unknown): value is GameScore {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((team) => Array.isArray((team as { players?: unknown })?.players))
  );
}

export default function SaveDetailPage({ save }: PageProps): React.JSX.Element {
  const date = new Date(save.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Layout
      title={save.title ?? 'Saved match'}
      description="Scorecard for a saved T20 cricket match."
      noIndex
    >
      <PageWrapper>
        <BackLink href="/dashboard"><span aria-hidden="true">← </span>Back to dashboard</BackLink>

        <PageHeader>
          <PageTitle>{save.title ?? 'Untitled game'}</PageTitle>
          <Meta>
            <DateLabel>{date}</DateLabel>
            <StatusBadge completed={save.completed}>
              {save.completed ? 'Completed' : 'In progress'}
            </StatusBadge>
          </Meta>
        </PageHeader>

        {save.gameScore ? (
          (() => {
            const [firstInningsTeam, secondInningsTeam] = save.gameScore;
            const showSecondInnings = secondInningsTeam.players.some(hasBatted);
            return (
              <ScorecardSection>
                <Scorecard
                  label="1st Innings"
                  battingTeam={firstInningsTeam}
                  bowlingTeam={secondInningsTeam}
                />
                {showSecondInnings && (
                  <Scorecard
                    label="2nd Innings"
                    battingTeam={secondInningsTeam}
                    bowlingTeam={firstInningsTeam}
                  />
                )}
              </ScorecardSection>
            );
          })()
        ) : (
          <EmptyState>This save could not be loaded.</EmptyState>
        )}
      </PageWrapper>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return { redirect: { destination: '/auth/signin', permanent: false } };
  }

  const id = context.params?.id;
  if (typeof id !== 'string') return { notFound: true };

  const save = await prisma.gameSave.findUnique({ where: { id } });
  if (!save || save.userId !== session.user.id) {
    return { notFound: true };
  }

  return {
    props: {
      save: {
        id: save.id,
        title: save.title,
        createdAt: save.createdAt.toISOString(),
        completed: save.completed,
        gameScore: isGameScore(save.gameData) ? save.gameData : null,
      },
    },
  };
};

const PageWrapper = styled.main`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const BackLink = styled(Link)`
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 700;

  &:hover {
    text-decoration: underline;
  }
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PageTitle = styled.h1`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 2rem;
  font-weight: 400;
  margin: 0;
  color: #1a1a1a;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DateLabel = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #767676;
`;

const StatusBadge = styled.span<{ completed: boolean }>`
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background-color: ${({ completed }) => (completed ? '#e8f5e9' : '#fff8e1')};
  color: ${({ completed }) => (completed ? '#2d7a4f' : '#b8860b')};
`;

const ScorecardSection = styled.div``;

const EmptyState = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #767676;
  margin: 0;
`;
