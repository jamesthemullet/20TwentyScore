import styled from '@emotion/styled';
import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import Layout from '../../components/layout/layout';
import SaveCard from '../../components/saves/SaveCard';
import { authOptions } from '../../lib/authOptions';
import { getUserTier } from '../../lib/subscription';
import { prisma } from '../../lib/prisma';

type SaveSummary = {
  id: string;
  title: string | null;
  createdAt: string;
  completed: boolean;
  seasonId: string | null;
};

type SeasonDetail = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  gameSaves: SaveSummary[];
};

type PageProps = {
  season: SeasonDetail;
};

export default function SeasonDetailPage({ season }: PageProps) {
  return (
    <Layout
      title={season.name}
      description={`Season: ${season.name} — match saves on 20Twenty Score.`}
    >
      <PageWrapper>
        <BackLink href="/seasons">← Back to seasons</BackLink>
        <PageTitle>{season.name}</PageTitle>
        {season.description && <Description>{season.description}</Description>}

        {season.gameSaves.length === 0 ? (
          <EmptyState>No games in this season yet. Add games from your dashboard.</EmptyState>
        ) : (
          <SavesGrid>
            {season.gameSaves.map((s) => (
              <SaveCard key={s.id} {...s} createdAt={new Date(s.createdAt)} />
            ))}
          </SavesGrid>
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

  const userId = session.user.id;
  const tier = await getUserTier(userId);
  if (tier === 'free') {
    return { redirect: { destination: '/seasons', permanent: false } };
  }

  const id = context.params?.id;
  if (typeof id !== 'string') return { notFound: true };
  const season = await prisma.season.findUnique({ where: { id } });
  if (!season || season.userId !== userId) {
    return { notFound: true };
  }

  const saves = await prisma.gameSave.findMany({
    where: { seasonId: id },
    select: { id: true, title: true, createdAt: true, completed: true, seasonId: true },
    orderBy: { createdAt: 'desc' },
  });

  return {
    props: {
      season: {
        id: season.id,
        name: season.name,
        description: season.description,
        createdAt: season.createdAt.toISOString(),
        updatedAt: season.updatedAt.toISOString(),
        gameSaves: saves.map((s) => ({
          id: s.id,
          title: s.title,
          completed: s.completed,
          seasonId: s.seasonId,
          createdAt: s.createdAt.toISOString(),
        })),
      },
    },
  };
};

const PageWrapper = styled.main`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PageTitle = styled.h1`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 2rem;
  font-weight: 400;
  margin: 0;
  color: #1a1a1a;
`;

const Description = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #555;
  margin: 0;
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

const SavesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const EmptyState = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #767676;
  margin: 0;
`;
