import styled from '@emotion/styled';
import Link from 'next/link';
import type { GameSave } from '@prisma/client';

type Season = { id: string; name: string };

type SaveCardProps = Pick<GameSave, 'id' | 'title' | 'createdAt' | 'completed'> & {
  seasonId?: string | null;
  seasons?: Season[];
  onSeasonChange?: (saveId: string, seasonId: string | null) => void;
};

export default function SaveCard({ id, title, createdAt, completed, seasonId, seasons, onSeasonChange }: SaveCardProps) {
  const date = new Date(createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const value = e.target.value;
    onSeasonChange?.(id, value === '' ? null : value);
  };

  return (
    <CardWrapper>
      <Card href={`/api/saves/${id}`}>
        <CardTitle>{title ?? 'Untitled game'}</CardTitle>
        <CardMeta>
          <DateLabel>{date}</DateLabel>
          <StatusBadge completed={completed}>{completed ? 'Completed' : 'In progress'}</StatusBadge>
        </CardMeta>
      </Card>
      {seasons && onSeasonChange && (
        <SeasonRow onClick={(e) => e.stopPropagation()}>
          <SeasonSelect value={seasonId ?? ''} onChange={handleSeasonChange}>
            <option value="">No season</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </SeasonSelect>
        </SeasonRow>
      )}
    </CardWrapper>
  );
}

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  border: 2px solid #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
`;

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  text-decoration: none;
  transition: background-color 0.15s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const CardTitle = styled.h3`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 1.1rem;
  color: #1a1a1a;
  margin: 0;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const DateLabel = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #767676;
  letter-spacing: 0.05em;
`;

const StatusBadge = styled.span<{ completed: boolean }>`
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background-color: ${({ completed }) => (completed ? '#2d7a4f' : '#e8a020')};
  color: #fff;
`;

const SeasonRow = styled.div`
  border-top: 1px solid #e0e0e0;
  padding: 0.5rem 1.5rem;
  background-color: #fafafa;
`;

const SeasonSelect = styled.select`
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #555;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 100%;
  outline: none;

  &:focus {
    color: #1a1a1a;
  }
`;
