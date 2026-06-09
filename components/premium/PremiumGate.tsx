import type React from 'react';
import { useAccount } from '../../context/AccountContext';
import UpgradeCTA from './UpgradeCTA';

type Props = { children: React.ReactNode };

export default function PremiumGate({ children }: Props) {
  const { tier, isLoading } = useAccount();
  if (isLoading) return null;
  if (tier === 'premium') return <>{children}</>;
  return <UpgradeCTA />;
}
