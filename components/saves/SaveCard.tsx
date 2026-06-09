import styled from '@emotion/styled';
import Link from 'next/link';
import type { GameSave } from '@prisma/client';

type SaveCardProps = Pick<GameSave, 'id' | 'title' | 'createdAt' | 'completed'>;

export default function SaveCard({ id, title, createdAt, completed }: SaveCardProps) {
  const date = new Date(createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card href={`/api/saves/${id}`}>
      <CardTitle>{title ?? 'Untitled game'}</CardTitle>
      <CardMeta>
        <DateLabel>{date}</DateLabel>
        <StatusBadge completed={completed}>{completed ? 'Completed' : 'In progress'}</StatusBadge>
      </CardMeta>
    </Card>
  );
}

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: 2px solid #1a1a1a;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  text-decoration: none;
  transition: background-color 0.15s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const CardTitle = styled.p`
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
