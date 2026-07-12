import styled from "@emotion/styled";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Layout from "../components/layout/layout";
import SaveCard from "../components/saves/SaveCard";
import UpgradeCTA from "../components/premium/UpgradeCTA";
import { useAccount } from "../context/AccountContext";
import { generateSaveTitle } from "../lib/gameSaveTitle";
import { useGameScore } from "../context/GameScoreContext";
import type { GameSave } from "@prisma/client";

type SaveSummary = Pick<
  GameSave,
  "id" | "title" | "createdAt" | "completed" | "seasonId"
>;

type SeasonSummary = { id: string; name: string };

export default function DashboardPage() {
  const { data: session } = useSession();
  const { tier, isLoading: accountLoading } = useAccount();
  const { gameScore } = useGameScore();
  const router = useRouter();
  const [saves, setSaves] = useState<SaveSummary[]>([]);
  const [seasons, setSeasons] = useState<SeasonSummary[]>([]);
  const [savesLoading, setSavesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savesError, setSavesError] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const [hasLocalGame] = useState<boolean>(
    () => typeof window !== "undefined" && Boolean(localStorage.getItem("gameData"))
  );

  useEffect(() => {
    if (!session) return;
    fetch("/api/saves")
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((data) => setSaves(data))
      .catch(() => setSavesError(true))
      .finally(() => setSavesLoading(false));
  }, [session]);

  useEffect(() => {
    if (!session || tier !== "premium") return;
    fetch("/api/seasons")
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((data: SeasonSummary[]) => setSeasons(data))
      .catch(() => {});
  }, [session, tier]);

  useEffect(() => {
    if (!session || router.query.checkout !== "success") return;
    fetch("/api/stripe/sync-subscription", { method: "POST" }).then(() => {
      sessionStorage.setItem("checkoutSuccess", "1");
      window.location.replace("/dashboard");
    });
  }, [session, router.query.checkout]);

  useEffect(() => {
    if (sessionStorage.getItem("checkoutSuccess")) {
      sessionStorage.removeItem("checkoutSuccess");
      setCheckoutSuccess(true);
    }
  }, []);

  const assignSeason = useCallback(async (saveId: string, seasonId: string | null) => {
    const res = await fetch(`/api/saves/${saveId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seasonId }),
    });
    if (res.ok) {
      setSaves((prev) =>
        prev.map((s) => (s.id === saveId ? { ...s, seasonId } : s))
      );
    }
  }, []);

  const saveToCloud = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const cloudSaveId = localStorage.getItem("cloudSaveId");
    const title = generateSaveTitle(gameScore);

    try {
      let res: Response;
      if (cloudSaveId) {
        res = await fetch(`/api/saves/${cloudSaveId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameData: gameScore, title }),
        });
      } else {
        res = await fetch("/api/saves", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameData: gameScore, title }),
        });
      }

      if (res.status === 402) {
        setSaveError("FREE_LIMIT_REACHED");
        return;
      }
      if (!res.ok) {
        setSaveError("Something went wrong. Please try again.");
        return;
      }

      const saved = (await res.json()) as SaveSummary;
      if (!cloudSaveId) localStorage.setItem("cloudSaveId", saved.id);
      setSaves((prev) => {
        const idx = prev.findIndex((s) => s.id === saved.id);
        return idx >= 0
          ? prev.map((s) => (s.id === saved.id ? saved : s))
          : [saved, ...prev];
      });
      setSaveSuccess(true);
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [gameScore]);

  if (!session) {
    return (
      <Layout
        title="Dashboard"
        description="View and manage your cloud saves and cricket seasons."
      >
        <PageWrapper>
          <p>
            Please <Link href="/auth/signin">sign in</Link> to view your
            dashboard.
          </p>
        </PageWrapper>
      </Layout>
    );
  }

  return (
    <Layout
      title="Dashboard"
      description="View and manage your cloud saves and cricket seasons."
    >
      <PageWrapper>
        {checkoutSuccess && (
          <CheckoutBanner role="status">
            Welcome to Premium! Your subscription is now active.
          </CheckoutBanner>
        )}

        <AccountSection>
          <Avatar>
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? ""}
                width={56}
                height={56}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <AvatarInitials>
                {session.user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) ?? "?"}
              </AvatarInitials>
            )}
          </Avatar>
          <AccountInfo>
            <AccountName>{session.user?.name}</AccountName>
            <AccountEmail>{session.user?.email}</AccountEmail>
          </AccountInfo>
          {!accountLoading && (
            <TierBadge premium={tier === "premium"}>
              {tier === "premium" ? "Premium" : "Free"}
            </TierBadge>
          )}
        </AccountSection>

        <SectionHeader>
          <SectionTitle>Cloud saves</SectionTitle>
          {hasLocalGame && (
            <SaveButton onClick={saveToCloud} disabled={saving}>
              {saving ? "Saving…" : "Save current game to cloud"}
            </SaveButton>
          )}
        </SectionHeader>

        {saveError === "FREE_LIMIT_REACHED" && (
          <UpgradePrompt>
            You&apos;ve reached the free save limit.{" "}
            <Link href="/account">Upgrade to Premium</Link> for unlimited saves.
          </UpgradePrompt>
        )}
        {saveError && saveError !== "FREE_LIMIT_REACHED" && (
          <ErrorMessage role="alert">{saveError}</ErrorMessage>
        )}
        {saveSuccess && <SuccessMessage role="status">Game saved!</SuccessMessage>}

        {savesLoading ? (
          <EmptyState>Loading saves…</EmptyState>
        ) : savesError ? (
          <ErrorMessage role="alert">Could not load saves. Please refresh.</ErrorMessage>
        ) : saves.length === 0 ? (
          <EmptyState>
            No cloud saves yet. Finish a game and save it from the Summary page.
          </EmptyState>
        ) : (
          <SavesGrid>
            {saves.map((s) => (
              <SaveCard
                key={s.id}
                {...s}
                seasons={tier === "premium" ? seasons : undefined}
                onSeasonChange={tier === "premium" ? assignSeason : undefined}
              />
            ))}
          </SavesGrid>
        )}

        <SeasonsSection>
          {tier === "premium" ? (
            <SeasonsLink href="/seasons">View Seasons →</SeasonsLink>
          ) : (
            <>
              <LockedLink>
                <LockIcon aria-hidden>🔒</LockIcon>
                Seasons — <UpgradeLink href="/dashboard#upgrade">Upgrade to Premium</UpgradeLink>
              </LockedLink>
              <UpgradeSection id="upgrade">
                <UpgradeCTA />
              </UpgradeSection>
            </>
          )}
        </SeasonsSection>
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

const AccountSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid #1a1a1a;
  border-radius: 12px;
`;

const Avatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarInitials = styled.span`
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: #fff;
`;

const AccountInfo = styled.div`
  flex: 1;
`;

const AccountName = styled.p`
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  font-size: 1.25rem;
  margin: 0;
  color: #1a1a1a;
`;

const AccountEmail = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.8rem;
  color: #767676;
  margin: 0;
`;

const TierBadge = styled.span<{ premium: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background-color: ${({ premium }) => (premium ? "#2d7a4f" : "#767676")};
  color: #fff;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  font-family: "Bodoni Moda", serif;
  font-style: italic;
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0;
  color: #1a1a1a;
`;

const SaveButton = styled.button`
  font-family: "Inter", sans-serif;
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

  &:hover:not(:disabled) {
    background-color: #555;
    border-color: #555;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SavesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const EmptyState = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  color: #767676;
  margin: 0;
`;

const UpgradePrompt = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  background-color: #fff8e1;
  border: 1px solid #e8a020;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #1a1a1a;

  a {
    color: #b83320;
    font-weight: 700;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  color: #b83320;
  margin: 0;
`;

const SuccessMessage = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  color: #2d7a4f;
  font-weight: 700;
  margin: 0;
`;

const SeasonsSection = styled.div`
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
`;

const SeasonsLink = styled(Link)`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a1a1a;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const LockedLink = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  color: #767676;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  a {
    color: #b83320;
    font-weight: 700;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const LockIcon = styled.span`
  font-size: 0.85rem;
`;

const UpgradeLink = styled(Link)`
  color: #b83320;
  font-weight: 700;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const UpgradeSection = styled.div`
  margin-top: 1.5rem;
`;

const CheckoutBanner = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  background-color: #e8f5e9;
  border: 1px solid #2d7a4f;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #2d7a4f;
`;
