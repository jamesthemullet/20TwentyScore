import styled from '@emotion/styled';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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

export default function SeasonDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [season, setSeason] = useState<SeasonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!session || !id) return;
    fetch(`/api/seasons/${id}`)
      .then((r) => {
        if (r.status === 404 || r.status === 403) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setSeason(data as SeasonDetail);
      })
      .finally(() => setLoading(false));
  }, [session, id]);

  if (!session) {
    return (
      <Layout
        title="Season"
        description="View match saves for this cricket season."
      >
        <PageWrapper>
          <p>
            Please <Link href="/auth/signin">sign in</Link> to view this season.
          </p>
        </PageWrapper>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout
        title="Season"
        description="View match saves for this cricket season."
      >
        <PageWrapper>
          <EmptyState>Loading season…</EmptyState>
        </PageWrapper>
      </Layout>
    );
  }

  if (notFound || !season) {
    return (
      <Layout
        title="Season not found"
        description="This season could not be found."
      >
        <PageWrapper>
          <EmptyState>Season not found.</EmptyState>
          <BackLink href="/seasons">← Back to seasons</BackLink>
        </PageWrapper>
      </Layout>
    );
  }

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
