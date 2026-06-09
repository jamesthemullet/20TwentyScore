import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { Subscription, User } from '@prisma/client';

type Tier = 'free' | 'premium';

type AccountContextType = {
  user: User | null;
  tier: Tier;
  subscription: Subscription | null;
  isLoading: boolean;
};

const AccountContext = createContext<AccountContextType>({
  user: null,
  tier: 'free',
  subscription: null,
  isLoading: false,
});

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<Tier>('free');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setUser(null);
      setTier('free');
      setSubscription(null);
      return;
    }
    if (status !== 'authenticated') return;

    setIsLoading(true);
    fetch('/api/account')
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setTier(data.tier);
        setSubscription(data.subscription);
      })
      .finally(() => setIsLoading(false));
  }, [status]);

  return (
    <AccountContext.Provider value={{ user, tier, subscription, isLoading }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount(): AccountContextType {
  return useContext(AccountContext);
}
