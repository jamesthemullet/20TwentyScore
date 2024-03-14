import React, { createContext, useContext, useState } from 'react';

const maxOvers = 20;

type OversContextType = {
  currentExtrasInThisOver: number;
  setCurrentExtrasInThisOver: (extras: number | string) => void;
  currentBallInThisOver: number;
  setCurrentBallInThisOver: (ball: number | null) => void;
  currentOver: number;
  incrementCurrentOver: () => void;
};

type OversProviderProps = {
  children: React.ReactNode;
};

export const OversContext = createContext<OversContextType>({
  currentExtrasInThisOver: 0,
  setCurrentExtrasInThisOver: (extras: number | string) => {
    console.log('Initial setCurrentExtrasInOver called with', extras);
  },
  currentBallInThisOver: 1,
  setCurrentBallInThisOver: (ball: number | null) => {
    console.log('Initial setCurrentBallInThisOver called');
  },
  currentOver: 1,
  incrementCurrentOver: () => {
    console.log('Initial incrementCurrentOver called');
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

  const [currentOver, incrementCurrentOverState] = useState(1);

  const incrementCurrentOver = () => {
    incrementCurrentOverState(currentOver + 1);
  };

  return (
    <OversContext.Provider
      value={{
        currentExtrasInThisOver,
        setCurrentExtrasInThisOver,
        currentBallInThisOver,
        setCurrentBallInThisOver,
        currentOver,
        incrementCurrentOver
      }}>
      {children}
    </OversContext.Provider>
  );
};
