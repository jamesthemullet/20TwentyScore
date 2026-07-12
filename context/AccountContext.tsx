import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { Subscription, User } from '@prisma/client';

type Tier = 'free' | 'premium';

type AccountContextType = {
  user: User | null;
  tier: Tier;
  subscription: Subscription | null;
  isLoading: boolean;
  refresh: () => void;
};

const AccountContext = createContext<AccountContextType>({
  user: null,
  tier: 'free',
  subscription: null,
  isLoading: false,
  refresh: () => {},
});

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<Tier>('free');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAccount = useCallback(() => {
    setIsLoading(true);
    fetch('/api/account')
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setTier(data.tier);
        setSubscription(data.subscription);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setUser(null);
      setTier('free');
      setSubscription(null);
      return;
    }
    if (status !== 'authenticated') return;
    fetchAccount();
  }, [status, fetchAccount]);

  const value = useMemo(
    () => ({ user, tier, subscription, isLoading, refresh: fetchAccount }),
    [user, tier, subscription, isLoading, fetchAccount]
  );

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount(): AccountContextType {
  return useContext(AccountContext);
}
