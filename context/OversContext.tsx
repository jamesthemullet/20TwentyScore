import React, { createContext, useContext, useState } from 'react';

type OversContextType = {
  currentExtrasInThisOver: number;
  setCurrentExtrasInThisOver: (extras: number | string) => void;
  currentBallInThisOver: number;
  setCurrentBallInThisOver: (ball: number | null) => void;
  currentOver: number;
  setCurrentOvers: (inc: number | undefined) => void;
  resetOvers: () => void;
};

type OversProviderProps = {
  children: React.ReactNode;
};

export const OversContext = createContext<OversContextType>({
  currentExtrasInThisOver: 0,
  setCurrentExtrasInThisOver: (extras: number | string) => {
    // eslint-disable-next-line no-console
    console.log('Initial setCurrentExtrasInOver called with', extras);
  },
  currentBallInThisOver: 1,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setCurrentBallInThisOver: (ball: number | null) => {
    // eslint-disable-next-line no-console
    console.log('Initial setCurrentBallInThisOver called');
  },
  currentOver: 1,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setCurrentOvers: (inc: number | undefined) => {
    // eslint-disable-next-line no-console
    console.log('Initial incrementCurrentOver called');
  },
  resetOvers: () => {
    // eslint-disable-next-line no-console
    console.log('Initial resetOvers called');
  }
});

export const useOvers = () => useContext(OversContext);

export const OversProvider: React.FC<OversProviderProps> = ({ children }) => {
  const [currentExtrasInThisOver, setCurrentExtrasInOverState] = useState(0);

  const setCurrentExtrasInThisOver = (extras: number | string) => {
    setCurrentExtrasInOverState(extras === 'reset' ? 0 : currentExtrasInThisOver + Number(extras));
  };

  const [currentBallInThisOver, setCurrentBallInOverState] = useState(1);

  const setCurrentBallInThisOver = (ball: number | null) => {
    setCurrentBallInOverState(ball || currentBallInThisOver + 1);
  };

  const [currentOver, setCurrentOverState] = useState(1);

  const setCurrentOvers = (inc: number | undefined) => {
    setCurrentOverState(!inc ? currentOver + 1 : 1);
  };

  return (
    <OversContext.Provider
      value={{
        currentExtrasInThisOver,
        setCurrentExtrasInThisOver,
        currentBallInThisOver,
        setCurrentBallInThisOver,
        currentOver,
        setCurrentOvers,
        resetOvers: () => {
          setCurrentExtrasInOverState(0);
          setCurrentBallInOverState(1);
          setCurrentOvers(1);
        }
      }}>
      {children}
    </OversContext.Provider>
  );
};
