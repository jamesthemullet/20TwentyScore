import React, { createContext, useContext, useState } from 'react';

type MostRecentActionContextType = {
  mostRecentAction: { runs: number; action: string | null };
  setMostRecentAction: (mostRecentAction: { runs: number; action: string | null }) => void;
};

type MostRecentActionProviderProps = {
  children: React.ReactNode;
};

export const MostRecentActionContext = createContext<MostRecentActionContextType>({
  mostRecentAction: {
    runs: 0,
    action: null
  },
  setMostRecentAction: (mostRecentAction) => {
    // eslint-disable-next-line no-console
    console.log('Initial setMostRecentAction called with', mostRecentAction);
  }
});

export const useMostRecentAction = () => useContext(MostRecentActionContext);

export const MostRecentActionProvider: React.FC<MostRecentActionProviderProps> = ({ children }) => {
  const [mostRecentAction, setMostRecentActionState] = useState<{
    runs: number;
    action: string | null;
  }>({
    runs: 0,
    action: null
  });

  const setMostRecentAction = (mostRecentAction: { runs: number; action: string | null }) => {
    setMostRecentActionState(mostRecentAction);
  };

  return (
    <MostRecentActionContext.Provider value={{ mostRecentAction, setMostRecentAction }}>
      {children}
    </MostRecentActionContext.Provider>
  );
};
