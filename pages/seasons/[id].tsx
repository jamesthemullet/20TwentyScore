import styled from '@emotion/styled';
import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { authOptions } from '../../lib/authOptions';
import { prisma } from '../../lib/prisma';
import { getUserTier } from '../../lib/subscription';
import Layout from '../../components/layout/layout';
import SaveCard from '../../components/saves/SaveCard';

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

type Props = {
  season: SeasonDetail;
};

export default function SeasonDetailPage({ season }: Props) {
  return (
    <Layout>
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

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return { redirect: { destination: '/auth/signin', permanent: false } };
  }

  const userId = session.user.id;
  const tier = await getUserTier(userId);
  if (tier === 'free') {
    return { redirect: { destination: '/dashboard', permanent: false } };
  }

  const id = context.params?.id as string;
  const season = await prisma.season.findUnique({
    where: { id },
    include: {
      gameSaves: {
        select: { id: true, title: true, createdAt: true, completed: true, seasonId: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!season || season.userId !== userId) {
    return { notFound: true };
  }

  return {
    props: {
      season: {
        id: season.id,
        name: season.name,
        description: season.description,
        createdAt: season.createdAt.toISOString(),
        updatedAt: season.updatedAt.toISOString(),
        gameSaves: season.gameSaves.map((s) => ({
          id: s.id,
          title: s.title,
          createdAt: s.createdAt.toISOString(),
          completed: s.completed,
          seasonId: s.seasonId,
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
