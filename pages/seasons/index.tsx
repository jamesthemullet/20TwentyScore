import styled from '@emotion/styled';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/layout/layout';
import SeasonCard from '../../components/seasons/SeasonCard';
import UpgradeCTA from '../../components/premium/UpgradeCTA';
import { useAccount } from '../../context/AccountContext';

type SeasonSummary = {
  id: string;
  name: string;
  description: string | null;
  gameCount: number;
  createdAt: string;
  updatedAt: string;
};

export default function SeasonsPage() {
  const { data: session } = useSession();
  const { tier, isLoading: accountLoading } = useAccount();
  const [seasons, setSeasons] = useState<SeasonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [seasonsError, setSeasonsError] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (!session || tier !== 'premium') return;
    fetch('/api/seasons')
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((data) => setSeasons(data))
      .catch(() => setSeasonsError(true))
      .finally(() => setLoading(false));
  }, [session, tier]);

  const createSeason = async (e: React.FormEvent) => {
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

  if (!session) {
    return (
      <Layout>
        <PageWrapper>
          <p>
            Please <Link href="/auth/signin">sign in</Link> to view your seasons.
          </p>
        </PageWrapper>
      </Layout>
    );
  }

  if (!accountLoading && tier === 'free') {
    return (
      <Layout>
        <PageWrapper>
          <PageTitle>Seasons</PageTitle>
          <UpgradeCTA />
        </PageWrapper>
      </Layout>
    );
  }

  return (
    <Layout>
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
            <Input
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

        {loading ? (
          <EmptyState>Loading seasons…</EmptyState>
        ) : seasonsError ? (
          <ErrorMessage role="alert">Could not load seasons. Please refresh.</ErrorMessage>
        ) : seasons.length === 0 ? (
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
