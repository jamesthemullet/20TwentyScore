import styled from '@emotion/styled';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import Layout from '../components/layout/layout';
import UpgradeCTA from '../components/premium/UpgradeCTA';
import { useAccount } from '../context/AccountContext';

export default function AccountPage() {
  const { tier, subscription, isLoading } = useAccount();
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  const openBillingPortal = async (): Promise<void> => {
    setBillingLoading(true);
    setBillingError(null);
    try {
      const res = await fetch('/api/stripe/create-portal-session', { method: 'POST' });
      if (!res.ok) {
        setBillingError('Could not open billing portal. Please try again.');
        return;
      }
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch {
      setBillingError('Something went wrong. Please try again.');
    } finally {
      setBillingLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout
        title="Account"
        description="Manage your 20Twenty Score account and subscription."
      >
        <PageWrapper>
          <LoadingText>Loading…</LoadingText>
        </PageWrapper>
      </Layout>
    );
  }

  return (
    <Layout
      title="Account"
      description="Manage your 20Twenty Score account and subscription."
    >
      <PageWrapper>
        <PageTitle>Account</PageTitle>

        <Section>
          <SectionLabel>Plan</SectionLabel>
          <PlanRow>
            <TierBadge premium={tier === 'premium'}>
              {tier === 'premium' ? 'Premium' : 'Free'}
            </TierBadge>
            {tier === 'premium' && subscription && (
              <PlanStatus>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                {subscription.plan && ` · ${subscription.plan}`}
              </PlanStatus>
            )}
          </PlanRow>

          {tier === 'premium' && (
            <>
              {billingError && <ErrorMessage role="alert">{billingError}</ErrorMessage>}
              <ManageBillingButton onClick={openBillingPortal} disabled={billingLoading}>
                {billingLoading ? 'Redirecting…' : 'Manage Billing'}
              </ManageBillingButton>
            </>
          )}
        </Section>

        {tier === 'free' && (
          <Section>
            <UpgradeCTA />
          </Section>
        )}

        <Section>
          <SignOutButton onClick={() => signOut({ callbackUrl: '/' })}>Sign out</SignOutButton>
        </Section>
      </PageWrapper>
    </Layout>
  );
}

const PageWrapper = styled.main`
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PageTitle = styled.h1`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 2rem;
  font-weight: 400;
  margin: 0;
  color: #1a1a1a;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid #1a1a1a;
  border-radius: 12px;
`;

const SectionLabel = styled.h2`
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #767676;
  margin: 0;
`;

const PlanRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const TierBadge = styled.span<{ premium: boolean }>`
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background-color: ${({ premium }) => (premium ? '#2d7a4f' : '#767676')};
  color: #fff;
`;

const PlanStatus = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #555;
`;

const ErrorMessage = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #b83320;
  margin: 0;
`;

const ManageBillingButton = styled.button`
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.55rem 1.25rem;
  border-radius: 999px;
  border: 2px solid #333;
  background-color: #fff;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  align-self: flex-start;

  &:hover:not(:disabled) {
    background-color: #333;
    color: #fff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SignOutButton = styled.button`
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.55rem 1.25rem;
  border-radius: 999px;
  border: 2px solid #b83320;
  background-color: #fff;
  color: #b83320;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  align-self: flex-start;

  &:hover {
    background-color: #b83320;
    color: #fff;
  }
`;

const LoadingText = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #767676;
`;
