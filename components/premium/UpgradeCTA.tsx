import { useState } from 'react';
import styled from '@emotion/styled';

export default function UpgradeCTA() {
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null);

  const subscribe = async (priceId: string | undefined, plan: 'monthly' | 'annual') => {
    if (!priceId) return;
    setLoading(plan);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const { url } = await res.json() as { url: string };
      window.location.href = url;
    } catch {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardTitle>Upgrade to Premium</CardTitle>
      <CardDescription>Unlimited cloud saves, seasons, and more.</CardDescription>
      <PriceOptions>
        <PriceOption>
          <PriceAmount>£2.99</PriceAmount>
          <PricePeriod>per month</PricePeriod>
          <SubscribeButton
            onClick={() => subscribe(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID, 'monthly')}
            disabled={loading !== null}
          >
            {loading === 'monthly' ? 'Redirecting…' : 'Subscribe monthly'}
          </SubscribeButton>
        </PriceOption>

        <Divider>or</Divider>

        <PriceOption>
          <PriceAmount>£9.99</PriceAmount>
          <PricePeriod>per year</PricePeriod>
          <AnnualBadge>Save 72%</AnnualBadge>
          <SubscribeButton
            onClick={() => subscribe(process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID, 'annual')}
            disabled={loading !== null}
          >
            {loading === 'annual' ? 'Redirecting…' : 'Subscribe annually'}
          </SubscribeButton>
        </PriceOption>
      </PriceOptions>
    </Card>
  );
}

const Card = styled.div`
  border: 2px solid #1a1a1a;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
`;

const CardTitle = styled.h2`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0 0 0.5rem;
  color: #1a1a1a;
`;

const CardDescription = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #555;
  margin: 0 0 1.5rem;
`;

const PriceOptions = styled.div`
  display: flex;
  align-items: stretch;
  gap: 1.5rem;

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PriceOption = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
`;

const PriceAmount = styled.span`
  font-family: 'Bodoni Moda', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
`;

const PricePeriod = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #767676;
  letter-spacing: 0.05em;
`;

const AnnualBadge = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #2d7a4f;
`;

const SubscribeButton = styled.button`
  margin-top: auto;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.55rem 1rem;
  border-radius: 999px;
  border: 2px solid #333;
  background-color: #333;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: #555;
    border-color: #555;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Divider = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: #aaa;
  flex-shrink: 0;
  align-self: center;
`;
