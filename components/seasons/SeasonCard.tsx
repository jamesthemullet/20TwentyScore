import styled from '@emotion/styled';
import Link from 'next/link';

type SeasonCardProps = {
  id: string;
  name: string;
  gameCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export default function SeasonCard({ id, name, gameCount, createdAt, updatedAt }: SeasonCardProps) {
  const start = new Date(createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const end = new Date(updatedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card href={`/seasons/${id}`}>
      <CardTitle>{name}</CardTitle>
      <CardMeta>
        <GameCount>{gameCount} {gameCount === 1 ? 'game' : 'games'}</GameCount>
        <DateRange>{start} – {end}</DateRange>
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

const GameCount = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 0.05em;
`;

const DateRange = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #767676;
  letter-spacing: 0.05em;
`;
