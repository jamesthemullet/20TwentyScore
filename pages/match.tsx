import styled from "@emotion/styled";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MilestoneToast } from "../components/milestone/MilestoneToast";
import Layout from "../components/layout/layout";
import Scoring from "../components/scoring/scoring";
import { useGameScore } from "../context/GameScoreContext";
import { useMostRecentAction } from "../context/MostRecentActionContext";
import { useOvers } from "../context/OversContext";
import { useMilestone } from "../utils/useMilestone";

const TOTAL_OVERS = 20;
const BALLS_PER_OVER = 6;
const TOTAL_BALLS = TOTAL_OVERS * BALLS_PER_OVER;
const MAX_RUN_RATE_DISPLAY = 12;
const MAX_PROJECTED_SCORE = 300;

const MatchPage: React.FC = () => {
  const [selectBowler, setSelectBowler] = useState(false);

  const { gameScore, setCurrentBowler } = useGameScore();
  const { currentOver, currentBallInThisOver, currentExtrasInThisOver } =
    useOvers();
  const { mostRecentAction } = useMostRecentAction();
  const milestone = useMilestone(mostRecentAction, gameScore, currentOver);

  const formatOvers = (overs: number, isBatting: boolean): string => {
    const balls = isBatting
      ? currentBallInThisOver - 1 - currentExtrasInThisOver
      : 0;
    return `${overs}.${balls}`;
  };

  const formatRunRate = (runs: number, overs: number, isBatting: boolean): string => {
    const balls = isBatting
      ? currentBallInThisOver - 1 - currentExtrasInThisOver
      : 0;
    const decimalOvers = overs + balls / BALLS_PER_OVER;
    if (decimalOvers === 0) return "0.00";
    return (runs / decimalOvers).toFixed(2);
  };

  const teamA = gameScore.find((team) => team.index === 0);
  const team1 = gameScore.find((team) => team.index === 1);
  const currentBattingTeam = gameScore.find((t) => t.currentBattingTeam);
  const currentBowlingTeam = gameScore.find((t) => t.currentBowlingTeam);
  const currentBowler = currentBowlingTeam?.players.find(
    (p) => p.currentBowler
  );
  const finishedTeam = gameScore.find((t) => t.finishedBatting);
  const target = finishedTeam ? finishedTeam.totalRuns + 1 : null;

  const currentRunRate = useMemo(() => {
    const runs = currentBattingTeam?.totalRuns ?? 0;
    const overs = currentBattingTeam?.overs ?? 0;
    const balls = currentBallInThisOver - 1 - currentExtrasInThisOver;
    const decimalOvers = overs + balls / 6;
    if (decimalOvers === 0) return "0.00";
    return (runs / decimalOvers).toFixed(2);
  }, [currentBattingTeam, currentBallInThisOver, currentExtrasInThisOver]);

  const batterStats = useMemo(() => {
    const derive = (actions: (string | null)[] | undefined) => ({
      balls: actions?.filter((a) => a !== null && a !== "Wide").length ?? 0,
      fours: actions?.filter((a) => a === "4").length ?? 0,
      sixes: actions?.filter((a) => a === "6").length ?? 0,
    });
    const striker = currentBattingTeam?.players.find((p) => p.currentStriker);
    const nonStriker = currentBattingTeam?.players.find((p) => p.currentNonStriker);
    return { striker: derive(striker?.allActions), nonStriker: derive(nonStriker?.allActions) };
  }, [currentBattingTeam]);

  const [overBalls, setOverBalls] = useState<string[]>([]);
  const [lastOverBalls, setLastOverBalls] = useState<string[]>([]);
  const [lastOverBowlerName, setLastOverBowlerName] = useState<string>("");
  const prevBallRef = useRef(currentBallInThisOver);
  const prevOverRef = useRef(currentOver);

  useEffect(() => {
    if (currentOver !== prevOverRef.current) {
      const { runs, action } = mostRecentAction;
      let lastLabel: string;
      if (action === "Wicket") lastLabel = "W";
      else if (action === "Wide") lastLabel = "Wd";
      else if (action === "No Ball") lastLabel = "NB";
      else lastLabel = String(runs);
      setLastOverBalls([...overBalls, lastLabel]);
      setLastOverBowlerName(currentBowler?.name ?? "");
      setOverBalls([]);
      prevOverRef.current = currentOver;
      prevBallRef.current = currentBallInThisOver;
      return;
    }
    if (currentBallInThisOver !== prevBallRef.current) {
      if (currentBallInThisOver < prevBallRef.current) {
        setOverBalls((prev) => prev.slice(0, -1));
      } else {
        const { runs, action } = mostRecentAction;
        let label: string;
        if (action === "Wicket") label = "W";
        else if (action === "Wide") label = "Wd";
        else if (action === "No Ball") label = "NB";
        else label = String(runs);
        setOverBalls((prev) => [...prev, label]);
      }
      prevBallRef.current = currentBallInThisOver;
    }
  }, [currentBallInThisOver, currentOver, mostRecentAction, overBalls, currentBowler?.name]);

  const thisOverRuns = useMemo(
    () =>
      overBalls.reduce((sum, b) => {
        const n = parseInt(b, 10);
        return sum + (Number.isNaN(n) ? 0 : n);
      }, 0),
    [overBalls]
  );

  const formatBallDescription = (label: string | undefined): string => {
    if (!label) return "—";
    if (label === "4") return "FOUR";
    if (label === "6") return "SIX";
    if (label === "W") return "WICKET";
    if (label === "Wd") return "WIDE";
    if (label === "NB") return "NO BALL";
    if (label === "0") return "DOT BALL";
    return `${label} RUN${label === "1" ? "" : "S"}`;
  };

  const formatLatestAction = (): string => {
    const { runs, action } = mostRecentAction;
    if (action === null || action === "Next Ball")
      return `${runs} run${runs !== 1 ? "s" : ""}`;
    if (runs > 0) return `${action} + ${runs}`;
    return action;
  };
  const hasGame = gameScore.length > 0;

  const currentBowlerSet = gameScore.some((team) =>
    team.players.some((p) => p.currentBowler)
  );

  const showBowlerSelect = selectBowler || (hasGame && !currentBowlerSet);

  const settingBowler = (teamIndex: number, playerIndex: number): void => {
    setCurrentBowler(teamIndex, playerIndex);
    setSelectBowler(false);
  };

  const handleSelectBowler = () => {
    setSelectBowler(true);
  };

  if (!hasGame) {
    return (
      <Layout
        title="Today's Match"
        description="Live scoring for your T20 cricket match. Record runs, wickets, and extras ball by ball."
      >
        <Main>
          <PageHeader>
            <PageTitleGroup>
              <PageNumber>No. I</PageNumber>
              <PageTitle>Today&apos;s Match</PageTitle>
              <TitleRule />
            </PageTitleGroup>
          </PageHeader>
          <EmptyState>
            <p>No active match found.</p>
            <Link href="/">Start a new match</Link>
          </EmptyState>
        </Main>
      </Layout>
    );
  }

  return (
    <Layout
      title="Today's Match"
      description="Live scoring for your T20 cricket match. Record runs, wickets, and extras ball by ball."
    >
      {milestone && <MilestoneToast message={milestone.message} accent={milestone.accent} />}
      <Main>
        <PageHeader>
          <PageTitleGroup>
            <PageNumber>No. I</PageNumber>
            <PageTitle>Today&apos;s Match</PageTitle>
            <TitleRule />
          </PageTitleGroup>
        </PageHeader>
        <MatchPanel>
          <TeamSide>
            <StatusLabel>
              <Ball color={teamA?.currentBattingTeam ? "#b83320" : "#aaa"} aria-hidden="true" />
              {teamA?.currentBattingTeam ? "Batting" : "Bowling"}
            </StatusLabel>
            <TeamName>{teamA?.name}</TeamName>
            <TeamScore>
              <Runs>{teamA?.totalRuns}</Runs>
              <Wickets>/{teamA?.totalWicketsConceded}</Wickets>
            </TeamScore>
            <TeamOvers>
              overs{" "}
              {formatOvers(teamA?.overs ?? 0, !!teamA?.currentBattingTeam)}
              <RunRate>
                RR{" "}
                {formatRunRate(
                  teamA?.totalRuns ?? 0,
                  teamA?.overs ?? 0,
                  !!teamA?.currentBattingTeam
                )}
              </RunRate>
            </TeamOvers>
          </TeamSide>
          <MatchCentre>
            <BallIconWrapper>
              <Image src="/icons/png/006-cricket-1.png" alt="cricket ball" fill style={{ objectFit: "contain" }} />
            </BallIconWrapper>
            <Vs>vs</Vs>
            <Format>T20 — 20 Overs</Format>
          </MatchCentre>
          <TeamSide align="right">
            <StatusLabel reverse>
              {team1?.currentBattingTeam ? "Batting" : "Bowling"}
              <Ball color={team1?.currentBattingTeam ? "#b83320" : "#aaa"} aria-hidden="true" />
            </StatusLabel>
            <TeamName>{team1?.name}</TeamName>
            <TeamScore>
              <Runs>{team1?.totalRuns}</Runs>
              <Wickets>/{team1?.totalWicketsConceded}</Wickets>
            </TeamScore>
            <TeamOvers>
              overs{" "}
              {formatOvers(team1?.overs ?? 0, !!team1?.currentBattingTeam)}
              <RunRate>
                RR{" "}
                {formatRunRate(
                  team1?.totalRuns ?? 0,
                  team1?.overs ?? 0,
                  !!team1?.currentBattingTeam
                )}
              </RunRate>
            </TeamOvers>
          </TeamSide>
        </MatchPanel>
        <LiveBar aria-live="polite" aria-label="Live match stats">
          <LiveAction>
            <LiveLabel>Last ball</LiveLabel>
            <LiveValue>{formatLatestAction()}</LiveValue>
          </LiveAction>
          <LiveStats>
            <LiveStat>
              <LiveLabel>Overs</LiveLabel>
              <LiveValue>
                {formatOvers(currentBattingTeam?.overs ?? 0, true)}
              </LiveValue>
            </LiveStat>
            <LiveStat>
              <LiveLabel>Run rate</LiveLabel>
              <LiveValue>
                {currentRunRate}
              </LiveValue>
            </LiveStat>
            {target !== null && (
              <LiveStat>
                <LiveLabel>Target</LiveLabel>
                <LiveValue>{target}</LiveValue>
              </LiveStat>
            )}
          </LiveStats>
        </LiveBar>
        <Board>
          <BoxStack>
              <ThisOverBox>
                <BoxHeader>
                  <BoxTitle>This over</BoxTitle>
                  <BoxMeta>Over {currentOver} of {TOTAL_OVERS}</BoxMeta>
                </BoxHeader>
                <BallRow>
                  {(() => {
                    const legitimateBalls = overBalls.filter(
                      (b) => b !== "Wd" && b !== "NB"
                    ).length;
                    const remaining = Math.max(0, 6 - legitimateBalls);
                    return (
                      <>
                        {overBalls.map((label, i) => {
                          const isExtra = label === "Wd" || label === "NB";
                          return (
                            <BallCircle
                              // biome-ignore lint/suspicious/noArrayIndexKey: ball position in over is stable
                              key={i}
                              filled={!isExtra}
                              extra={isExtra}
                              wicket={label === "W"}
                              four={label === "4"}
                              six={label === "6"}
                            >
                              {label}
                            </BallCircle>
                          );
                        })}
                        {Array.from({ length: remaining }).map((_, i) => (
                          <BallCircle
                            // biome-ignore lint/suspicious/noArrayIndexKey: placeholder slots have no stable identity
                            key={`empty-${i}`}
                            filled={false}
                            extra={false}
                            wicket={false}
                            four={false}
                            six={false}
                          >
                            ·
                          </BallCircle>
                        ))}
                      </>
                    );
                  })()}
                </BallRow>
                <OverSummary>
                  <OverSummaryItem>
                    <StatLabel>This over</StatLabel>
                    <StatValue>
                      {thisOverRuns} run{thisOverRuns !== 1 ? "s" : ""}
                    </StatValue>
                  </OverSummaryItem>
                  <OverSummaryItem>
                    <StatLabel>Last ball</StatLabel>
                    <StatValue>
                      {formatBallDescription(overBalls[overBalls.length - 1])}
                    </StatValue>
                  </OverSummaryItem>
                </OverSummary>
              </ThisOverBox>
              <AtCreaseBox>
                <BoxHeader>
                  <BoxTitle>At the crease</BoxTitle>
                </BoxHeader>
                <CreasePlayers>
                  {(
                    [
                      {
                        player: currentBattingTeam?.players.find(
                          (p) => p.currentStriker
                        ),
                        stats: batterStats.striker,
                        label: "★ On strike",
                        strike: true,
                      },
                      {
                        player: currentBattingTeam?.players.find(
                          (p) => p.currentNonStriker
                        ),
                        stats: batterStats.nonStriker,
                        label: "Non-striker",
                        strike: false,
                      },
                    ] as const
                  ).map(({ player, stats, label, strike }) => (
                    <CreasePlayer key={label}>
                      <CreaseRole strike={strike}>{label}</CreaseRole>
                      <CreasePlayerName>{player?.name ?? "—"}</CreasePlayerName>
                      <BatterStats>
                        <BatterStat>
                          <StatLabel>R</StatLabel>
                          <StatValue>{player?.runs ?? 0}</StatValue>
                        </BatterStat>
                        <BatterStat>
                          <StatLabel>B</StatLabel>
                          <StatValue>{stats.balls}</StatValue>
                        </BatterStat>
                        <BatterStat>
                          <StatLabel>4s</StatLabel>
                          <StatValue>{stats.fours}</StatValue>
                        </BatterStat>
                        <BatterStat>
                          <StatLabel>6s</StatLabel>
                          <StatValue>{stats.sixes}</StatValue>
                        </BatterStat>
                      </BatterStats>
                    </CreasePlayer>
                  ))}
                </CreasePlayers>
                <BowlerSection>
                  <CreaseRole bowling>Bowling</CreaseRole>
                  <BowlerRow>
                    <CreasePlayerName>
                      {currentBowler?.name ?? "—"}
                    </CreasePlayerName>
                    <BatterStats>
                      <BatterStat>
                        <StatLabel>Ov</StatLabel>
                        <StatValue>{currentBowler?.oversBowled ?? 0}</StatValue>
                      </BatterStat>
                      <BatterStat>
                        <StatLabel>Wk</StatLabel>
                        <StatValue>
                          {currentBowler?.wicketsTaken ?? 0}
                        </StatValue>
                      </BatterStat>
                    </BatterStats>
                  </BowlerRow>
                </BowlerSection>
              </AtCreaseBox>
              <BottomBoxRow>
                <BottomBox>
                  <BoxMeta>Run rate</BoxMeta>
                  <SplitStat>
                    {currentRunRate}
                  </SplitStat>
                  <GreenBarTrack aria-hidden="true">
                    <GreenBar
                      fill={Math.min(parseFloat(currentRunRate) / MAX_RUN_RATE_DISPLAY, 1)}
                    />
                  </GreenBarTrack>
                  <RunsSummaryDivider />
                  <RunsSummary>
                    {currentBattingTeam?.totalRuns ?? 0} runs from{" "}
                    {(currentBattingTeam?.overs ?? 0) * BALLS_PER_OVER +
                      (currentBallInThisOver -
                        1 -
                        currentExtrasInThisOver)}{" "}
                    balls
                  </RunsSummary>
                </BottomBox>
                <BottomBox>
                  {(() => {
                    const rr = parseFloat(currentRunRate);
                    const validBallsInOver =
                      currentBallInThisOver - 1 - currentExtrasInThisOver;
                    const ballsUsed =
                      (currentBattingTeam?.overs ?? 0) * BALLS_PER_OVER + validBallsInOver;
                    const ballsRemaining = TOTAL_BALLS - ballsUsed;

                    if (finishedTeam && target !== null) {
                      const runsNeeded = Math.max(
                        0,
                        target - (currentBattingTeam?.totalRuns ?? 0)
                      );
                      const oversRemaining = ballsRemaining / BALLS_PER_OVER;
                      const requiredRate =
                        oversRemaining > 0
                          ? (runsNeeded / oversRemaining).toFixed(2)
                          : "—";
                      const rrFill = Math.min(parseFloat(requiredRate) / MAX_RUN_RATE_DISPLAY, 1);
                      return (
                        <>
                          <BoxMeta>Required rate</BoxMeta>
                          <SplitStat>{requiredRate}</SplitStat>
                          <RedBarTrack aria-hidden="true">
                            <RedBar fill={Number.isNaN(rrFill) ? 0 : rrFill} />
                          </RedBarTrack>
                          <RunsSummaryDivider />
                          <RunsSummary>
                            Need {runsNeeded} from {ballsRemaining} ball
                            {ballsRemaining !== 1 ? "s" : ""}
                          </RunsSummary>
                        </>
                      );
                    }

                    const projected = Math.round(rr * TOTAL_OVERS);
                    return (
                      <>
                        <BoxMeta>Projected</BoxMeta>
                        <SplitStat>{projected}</SplitStat>
                        <RedBarTrack aria-hidden="true">
                          <RedBar fill={Math.min(projected / MAX_PROJECTED_SCORE, 1)} />
                        </RedBarTrack>
                        <RunsSummaryDivider />
                        <RunsSummary>At this rate over {TOTAL_OVERS} overs</RunsSummary>
                      </>
                    );
                  })()}
                </BottomBox>
              </BottomBoxRow>
            </BoxStack>
            {showBowlerSelect ? (
              <BowlerSelectPanel>
                {lastOverBowlerName && (
                  <EndOfOverSection>
                    <EndOfOverHeader>
                      <EndOfOverItalic>End of over</EndOfOverItalic>
                      <EndOfOverRule />
                      <EndOfOverMeta>Over {currentOver - 1} complete</EndOfOverMeta>
                    </EndOfOverHeader>
                    <LastOverRow>
                      <LastOverLabel>Last over from</LastOverLabel>
                      <LastOverBowler>{lastOverBowlerName}</LastOverBowler>
                    </LastOverRow>
                    <BallRow>
                      {lastOverBalls.map((label, i) => {
                        const isExtra = label === "Wd" || label === "NB";
                        return (
                          <BallCircle
                            // biome-ignore lint/suspicious/noArrayIndexKey: ball position in over is stable
                            key={i}
                            filled={!isExtra}
                            extra={isExtra}
                            wicket={label === "W"}
                            four={label === "4"}
                            six={label === "6"}
                          >
                            {label}
                          </BallCircle>
                        );
                      })}
                    </BallRow>
                  </EndOfOverSection>
                )}
                <BowlerPickHeader>
                  <BowlerPickNumber>II.</BowlerPickNumber>
                  <BowlerPickTitle>Captain — who&apos;s bowling next?</BowlerPickTitle>
                </BowlerPickHeader>
                <BowlerList>
                  {currentBowlingTeam?.players.map((player, idx) => {
                    const isJustBowled = player.currentBowler;
                    const hasBowled = player.oversBowled > 0;
                    const runsConceded = player.runsConceded ?? 0;
                    const economyVal = hasBowled ? runsConceded / player.oversBowled : null;
                    const economy =
                      economyVal !== null && Number.isFinite(economyVal)
                        ? economyVal.toFixed(2)
                        : null;
                    return (
                      <BowlerListItem
                        key={player.name}
                        type="button"
                        disabled={isJustBowled}
                        onClick={() =>
                          settingBowler(currentBowlingTeam.index, player.index)
                        }
                      >
                        <BowlerItemNumber disabled={isJustBowled}>
                          {idx + 1}
                        </BowlerItemNumber>
                        <BowlerItemInfo>
                          <BowlerItemName disabled={isJustBowled}>
                            {player.name}
                          </BowlerItemName>
                          <BowlerItemStatus disabled={isJustBowled}>
                            {isJustBowled
                              ? "Just bowled — needs a rest"
                              : hasBowled
                              ? `${player.oversBowled} ov · ${runsConceded} runs · ${player.wicketsTaken} wkt${player.wicketsTaken !== 1 ? "s" : ""}`
                              : "Fresh"}
                          </BowlerItemStatus>
                        </BowlerItemInfo>
                        {!isJustBowled && (
                          <BowlerItemEcon>
                            {economy ? `${economy} econ` : "— econ"}
                          </BowlerItemEcon>
                        )}
                        {!isJustBowled && <BowlerItemArrow aria-hidden="true">→</BowlerItemArrow>}
                      </BowlerListItem>
                    );
                  })}
                </BowlerList>
              </BowlerSelectPanel>
            ) : (
              <Scoring setSelectBowler={handleSelectBowler} />
            )}
          </Board>
      </Main>
    </Layout>
  );
};

export default MatchPage;

const Main = styled.main`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  flex: 1;
`;

const BoxStack = styled.div`
  display: flex;
  flex-direction: column;
  flex: 10;
  gap: 10px;
`;

const ThisOverBox = styled.div`
  border: 2px solid #1a1a1a;
  border-radius: 12px;
  flex: 1;
  min-height: 120px;
  padding: 1rem 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
`;

const BoxHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BoxTitle = styled.h2`
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  font-size: 1.5rem;
  font-weight: 400;
  color: #1a1a1a;
  margin: 0;
`;

const BoxMeta = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.75rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #767676;
  margin: 0;
`;

const OverSummary = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: auto;
  padding-top: 1rem;
`;

const OverSummaryItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
`;

const BallRow = styled.div`
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;
`;

const BallCircle = styled.div<{
  filled: boolean;
  extra: boolean;
  wicket: boolean;
  four: boolean;
  six: boolean;
}>`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px ${({ filled }) => (filled ? "solid" : "dashed")}
    ${({ wicket, four, six, extra }) =>
      wicket || four
        ? "#b83320"
        : six
        ? "#c9a84c"
        : extra
        ? "#1a1a1a"
        : "#aaa"};
  background-color: ${({ filled, wicket, four, six }) =>
    !filled
      ? "transparent"
      : wicket || four
      ? "#b83320"
      : six
      ? "#c9a84c"
      : "#1a1a1a"};
  color: ${({ filled, extra }) =>
    filled ? "#fff" : extra ? "#1a1a1a" : "#ccc"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.75rem;
  font-weight: 700;
`;

const CreasePlayers = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
`;

const CreasePlayer = styled.div`
  flex: 1;
  border: 1px solid #1a1a1a;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
`;

const CreaseRole = styled.p<{ strike?: boolean; bowling?: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${({ strike, bowling }) =>
    strike ? "#b83320" : bowling ? "#2d7a4f" : "#767676"};
  margin: 0 0 0.25rem;
`;

const CreasePlayerName = styled.p`
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  font-size: 1rem;
  color: #1a1a1a;
  margin: 0;
`;

const BatterStats = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.4rem;
`;

const BatterStat = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
`;

const StatLabel = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.6rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #767676;
`;

const StatValue = styled.span`
  font-family: "JetBrains Mono", monospace;
  font-size: 0.85rem;
  font-weight: 700;
  color: #1a1a1a;
`;

const BowlerSection = styled.div`
  margin-top: 0.75rem;
  border: 1px solid #1a1a1a;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
`;

const BowlerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
`;

const AtCreaseBox = styled.div`
  border: 2px solid #1a1a1a;
  border-radius: 12px;
  flex: 2;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
`;

const BottomBoxRow = styled.div`
  display: flex;
  gap: 10px;
  flex: 1;
`;

const BottomBox = styled.div`
  flex: 1;
  border: 2px solid #1a1a1a;
  border-radius: 12px;
  min-height: 120px;
  padding: 1rem 1.25rem;
`;

const RunsSummaryDivider = styled.hr`
  border: none;
  border-top: 1px solid #1a1a1a;
  margin: 1.25rem 0 0;
`;

const RunsSummary = styled.p`
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  font-size: 0.8rem;
  color: #555;
  margin: 0.4rem 0 0;
`;

const RedBarTrack = styled.div`
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background-color: #e0e0e0;
  margin-top: 0.75rem;
  overflow: hidden;
`;

const RedBar = styled.div<{ fill: number }>`
  height: 100%;
  border-radius: 999px;
  background-color: #b83320;
  width: ${({ fill }) => Math.round(fill * 100)}%;
  transition: width 0.4s ease;
`;

const GreenBarTrack = styled.div`
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background-color: #e0e0e0;
  margin-top: 0.75rem;
  overflow: hidden;
`;

const GreenBar = styled.div<{ fill: number }>`
  height: 100%;
  border-radius: 999px;
  background-color: #2d7a4f;
  width: ${({ fill }) => Math.round(fill * 100)}%;
  transition: width 0.4s ease;
`;

const SplitStat = styled.p`
  font-family: "JetBrains Mono", monospace;
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0.25rem 0 0;
`;

const _EmptyBox = styled.div`
  border: 2px solid #1a1a1a;
  border-radius: 12px;
  flex: 1;
  min-height: 120px;
`;

const Board = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  flex: 1;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: stretch;
  }
`;

const BowlerSelectPanel = styled.div`
  display: flex;
  flex-direction: column;
  border: 2px solid #1a1a1a;
  border-radius: 12px;
  flex: 10;
  order: 2;
  padding: 20px;
  overflow: hidden;
`;

const EndOfOverSection = styled.div`
  border-bottom: 1px solid #ddd;
  padding-bottom: 1.25rem;
  margin-bottom: 1.25rem;
`;

const EndOfOverHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const EndOfOverItalic = styled.h2`
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  font-size: 1.5rem;
  font-weight: 400;
  color: #1a1a1a;
  margin: 0;
  white-space: nowrap;
`;

const EndOfOverRule = styled.hr`
  flex: 1;
  border: none;
  border-top: 1px solid #1a1a1a;
  margin: 0;
`;

const EndOfOverMeta = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #767676;
  white-space: nowrap;
`;

const LastOverRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const LastOverLabel = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #767676;
`;

const LastOverBowler = styled.span`
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  font-size: 1.1rem;
  color: #1a1a1a;
`;

const BowlerPickHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const BowlerPickNumber = styled.span`
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  color: #b83320;
  font-size: 1.25rem;
`;

const BowlerPickTitle = styled.h2`
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  font-size: 1.5rem;
  font-weight: 400;
  color: #1a1a1a;
  margin: 0;
`;

const BowlerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  flex: 1;
`;

const BowlerListItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.5rem;
  background: none;
  border: none;
  border-bottom: 1px solid #eee;
  border-radius: 0;
  width: 100%;
  text-align: left;
  font: inherit;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.45 : 1)};
  transition: background-color 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover:not(:disabled) {
    background-color: #f7f5f0;
    border-radius: 8px;
  }
`;

const BowlerItemNumber = styled.div<{ disabled?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid ${({ disabled }) => (disabled ? "#aaa" : "#1a1a1a")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  font-size: 0.9rem;
  color: ${({ disabled }) => (disabled ? "#aaa" : "#1a1a1a")};
  flex-shrink: 0;
`;

const BowlerItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`;

const BowlerItemName = styled.p<{ disabled?: boolean }>`
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  font-size: 1rem;
  color: ${({ disabled }) => (disabled ? "#aaa" : "#1a1a1a")};
  margin: 0;
`;

const BowlerItemStatus = styled.span<{ disabled?: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.6rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${({ disabled }) => (disabled ? "#aaa" : "#767676")};
`;

const BowlerItemEcon = styled.span`
  font-family: "JetBrains Mono", monospace;
  font-size: 0.75rem;
  color: #767676;
  flex-shrink: 0;
`;

const BowlerItemArrow = styled.span`
  font-size: 1rem;
  color: #b83320;
  flex-shrink: 0;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1.5rem 1.5rem;
`;

const PageTitleGroup = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex: 1;
`;

const PageNumber = styled.span`
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  color: #b83320;
  font-size: 1.25rem;
  white-space: nowrap;
`;

const PageTitle = styled.h1`
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  font-size: 1.75rem;
  font-weight: 400;
  margin: 0;
  color: #1a1a1a;
  white-space: nowrap;
`;

const TitleRule = styled.hr`
  flex: 1;
  border: none;
  border-top: 1px solid #1a1a1a;
  margin: 0;
`;

const LiveBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1a1a1a;
  color: #fff;
  margin: 1.25rem auto 0;
  padding: 0.6rem 1.5rem;
  max-width: 1400px;
  width: calc(100% - 3rem);
  border-radius: 8px;
`;

const LiveAction = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LiveStats = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const LiveStat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LiveLabel = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #aaa;
`;

const LiveValue = styled.span`
  font-family: "JetBrains Mono", monospace;
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
`;

const MatchPanel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid #1a1a1a;
  border-radius: 12px;
  margin: 1rem auto 0;
  padding: 1.25rem 1.5rem;
  max-width: 1400px;
  width: calc(100% - 3rem);

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
  }
`;

const TeamSide = styled.div<{ align?: string }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  text-align: ${({ align }) => align ?? "left"};
  align-items: ${({ align }) =>
    align === "right" ? "flex-end" : "flex-start"};
`;

const TeamName = styled.p`
  font-family: "Bodoni Moda", serif;
  font-size: 1.5rem;
  font-style: italic;
  color: #1a1a1a;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const TeamScore = styled.p`
  display: flex;
  align-items: baseline;
  gap: 0;
  margin: 0;
  line-height: 1;
`;

const Runs = styled.span`
  font-family: "JetBrains Mono", monospace;
  font-size: 5rem;
  font-weight: 700;
  color: #1a1a1a;

  @media (max-width: 768px) {
    font-size: 2.75rem;
  }
`;

const Wickets = styled.span`
  font-family: "JetBrains Mono", monospace;
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const TeamOvers = styled.p`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: "Inter", sans-serif;
  font-size: 0.8rem;
  color: #767676;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 0.6rem;
    gap: 0.5rem;
    letter-spacing: 1px;
  }
`;

const RunRate = styled.span`
  font-family: "JetBrains Mono", monospace;
`;

const StatusLabel = styled.span<{ reverse?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-direction: ${({ reverse }) => (reverse ? "row-reverse" : "row")};
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #666;
`;

const Ball = styled.span<{ color: string }>`
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  flex-shrink: 0;
`;

const MatchCentre = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  margin: 0 1.5rem;

  @media (max-width: 768px) {
    margin: 0 0.5rem;
  }
`;

const BallIconWrapper = styled.span`
  position: relative;
  width: 48px;
  height: 48px;

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
  }
`;

const Vs = styled.p`
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  font-size: 1.75rem;
  color: #1a1a1a;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Format = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #767676;
  margin: 0;
  white-space: nowrap;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;

  a {
    color: #333;
    font-weight: bold;
  }
`;
