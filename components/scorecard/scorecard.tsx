import styled from '@emotion/styled';
import type React from 'react';
import type { Team } from '../../context/GameContext';
import {
  deriveBattingStats,
  deriveBowlingStats,
  deriveTeamExtras,
  dismissalText,
  hasBatted,
  hasBowled
} from '../../utils/scorecardStats';

type ScorecardProps = {
  label: string;
  battingTeam: Team;
  bowlingTeam: Team;
};

const Scorecard: React.FC<ScorecardProps> = ({ label, battingTeam, bowlingTeam }) => {
  const batted = battingTeam.players.filter(hasBatted);
  const didNotBat = battingTeam.players.filter((p) => !hasBatted(p));
  const bowlers = bowlingTeam.players.filter(hasBowled);
  const extras = deriveTeamExtras(battingTeam);

  return (
    <ScorecardWrapper>
      <ScorecardHeader>
        <ScorecardLabel>{label}</ScorecardLabel>
        <ScorecardTeamName>{battingTeam.name}</ScorecardTeamName>
      </ScorecardHeader>

      <TableWrap>
        <Table>
          <caption className="visually-hidden">{label}: {battingTeam.name} batting</caption>
          <thead>
            <tr>
              <Th scope="col" align="left">Batsman</Th>
              <Th scope="col" align="left">Dismissal</Th>
              <Th scope="col">R</Th>
              <Th scope="col">B</Th>
              <Th scope="col">4s</Th>
              <Th scope="col">6s</Th>
              <Th scope="col">SR</Th>
            </tr>
          </thead>
          <tbody>
            {batted.map((player) => {
              const stats = deriveBattingStats(player);
              return (
                <tr key={player.index}>
                  <Td align="left">{player.name}</Td>
                  <Td align="left" muted>
                    {dismissalText(player)}
                  </Td>
                  <Td strong>{player.runs}</Td>
                  <Td>{stats.balls}</Td>
                  <Td>{stats.fours}</Td>
                  <Td>{stats.sixes}</Td>
                  <Td>{stats.strikeRate}</Td>
                </tr>
              );
            })}
            <ExtrasRow>
              <Td align="left" colSpan={2}>
                Extras
              </Td>
              <Td colSpan={5}>{extras}</Td>
            </ExtrasRow>
            <TotalRow>
              <Td align="left" colSpan={2} strong>
                Total
              </Td>
              <Td colSpan={5} strong>
                {battingTeam.totalRuns}/{battingTeam.totalWicketsConceded} ({battingTeam.overs.toFixed(1)} ov)
              </Td>
            </TotalRow>
          </tbody>
        </Table>
        {didNotBat.length > 0 && (
          <DidNotBat>Did not bat: {didNotBat.map((p) => p.name).join(', ')}</DidNotBat>
        )}
      </TableWrap>

      {bowlers.length > 0 && (
        <TableWrap>
          <Table>
            <caption className="visually-hidden">{label}: {bowlingTeam.name} bowling</caption>
            <thead>
              <tr>
                <Th scope="col" align="left">Bowler</Th>
                <Th scope="col">O</Th>
                <Th scope="col">M</Th>
                <Th scope="col">R</Th>
                <Th scope="col">W</Th>
                <Th scope="col">Econ</Th>
              </tr>
            </thead>
            <tbody>
              {bowlers.map((player) => {
                const stats = deriveBowlingStats(player);
                return (
                  <tr key={player.index}>
                    <Td align="left">{player.name}</Td>
                    <Td>{stats.oversDisplay}</Td>
                    <Td>{stats.maidens}</Td>
                    <Td>{player.runsConceded ?? 0}</Td>
                    <Td strong>{player.wicketsTaken}</Td>
                    <Td>{stats.economy}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </ScorecardWrapper>
  );
};

export default Scorecard;

const ScorecardWrapper = styled.div`
  border: 2px solid #1a1a1a;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
`;

const ScorecardHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

const ScorecardLabel = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #767676;
`;

const ScorecardTeamName = styled.h3`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-weight: 400;
  font-size: 1.35rem;
  color: #1a1a1a;
  margin: 0;
`;

const TableWrap = styled.div`
  overflow-x: auto;
  margin-bottom: 1.25rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
`;

const Th = styled.th<{ align?: string }>`
  text-align: ${({ align }) => align ?? 'right'};
  padding: 0.4rem 0.5rem;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #767676;
  border-bottom: 1px solid #1a1a1a;
  white-space: nowrap;
`;

const Td = styled.td<{ align?: string; muted?: boolean; strong?: boolean }>`
  text-align: ${({ align }) => align ?? 'right'};
  padding: 0.4rem 0.5rem;
  color: ${({ muted }) => (muted ? '#767676' : '#1a1a1a')};
  font-weight: ${({ strong }) => (strong ? 700 : 400)};
  font-family: ${({ align }) => (align === 'left' ? "'Inter', sans-serif" : "'JetBrains Mono', monospace")};
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
`;

const ExtrasRow = styled.tr`
  color: #767676;
`;

const TotalRow = styled.tr`
  td {
    border-bottom: none;
    border-top: 2px solid #1a1a1a;
    padding-top: 0.6rem;
  }
`;

const DidNotBat = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #767676;
  margin: 0.5rem 0 0;
`;
