import styled from '@emotion/styled';
import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import type React from 'react';
import { useState } from 'react';
import Layout from '../../components/layout/layout';
import SeasonCard from '../../components/seasons/SeasonCard';
import UpgradeCTA from '../../components/premium/UpgradeCTA';
import { authOptions } from '../../lib/authOptions';
import { getUserTier } from '../../lib/subscription';
import { prisma } from '../../lib/prisma';

type SeasonSummary = {
  id: string;
  name: string;
  description: string | null;
  gameCount: number;
  createdAt: string;
  updatedAt: string;
};

type PageProps = {
  tier: 'free' | 'premium';
  seasons: SeasonSummary[];
};

export default function SeasonsPage({ tier, seasons: initialSeasons }: PageProps) {
  const [seasons, setSeasons] = useState<SeasonSummary[]>(initialSeasons);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const createSeason = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/seasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const season = (await res.json()) as SeasonSummary & { gameCount?: number };
        setSeasons((prev) => [{ ...season, gameCount: season.gameCount ?? 0 }, ...prev]);
        setNewName('');
        setFormOpen(false);
      } else {
        setCreateError('Could not create season. Please try again.');
      }
    } catch {
      setCreateError('Something went wrong. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (tier === 'free') {
    return (
      <Layout
        title="Seasons"
        description="Create and manage your T20 cricket seasons to group and track your matches."
      >
        <PageWrapper>
          <PageTitle>Seasons</PageTitle>
          <UpgradeCTA />
        </PageWrapper>
      </Layout>
    );
  }

  return (
    <Layout
      title="Seasons"
      description="Create and manage your T20 cricket seasons to group and track your matches."
    >
      <PageWrapper>
        <PageHeader>
          <PageTitle>Seasons</PageTitle>
          <NewButton onClick={() => setFormOpen((v) => !v)}>
            {formOpen ? 'Cancel' : 'New season'}
          </NewButton>
        </PageHeader>

        {createError && <ErrorMessage role="alert">{createError}</ErrorMessage>}

        {formOpen && (
          <Form onSubmit={createSeason}>
            <label htmlFor="season-name" className="visually-hidden">Season name</label>
            <Input
              id="season-name"
              type="text"
              placeholder="Season name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <SubmitButton type="submit" disabled={creating || !newName.trim()}>
              {creating ? 'Creating…' : 'Create'}
            </SubmitButton>
          </Form>
        )}

        {seasons.length === 0 ? (
          <EmptyState>No seasons yet. Create one to group your games.</EmptyState>
        ) : (
          <SeasonsGrid>
            {seasons.map((s) => (
              <SeasonCard key={s.id} {...s} />
            ))}
          </SeasonsGrid>
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
    return { props: { tier: 'free', seasons: [] } };
  }

  const seasons = await prisma.season.findMany({
    where: { userId },
    include: { _count: { select: { gameSaves: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return {
    props: {
      tier: 'premium',
      seasons: seasons.map(({ _count, id, name, description, createdAt, updatedAt }) => ({
        id,
        name,
        description,
        gameCount: _count.gameSaves,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      })),
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
  gap: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const PageTitle = styled.h1`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 2rem;
  font-weight: 400;
  margin: 0;
  color: #1a1a1a;
`;

const NewButton = styled.button`
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  border: 2px solid #333;
  background-color: #333;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #555;
    border-color: #555;
  }
`;

const Form = styled.form`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const Input = styled.input`
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  padding: 0.55rem 1rem;
  border: 2px solid #1a1a1a;
  border-radius: 8px;
  flex: 1;
  outline: none;

  &:focus {
    border-color: #555;
  }
`;

const SubmitButton = styled.button`
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.55rem 1.25rem;
  border-radius: 999px;
  border: 2px solid #2d7a4f;
  background-color: #2d7a4f;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #23623f;
    border-color: #23623f;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SeasonsGrid = styled.div`
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

const ErrorMessage = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #b83320;
  margin: 0;
`;
