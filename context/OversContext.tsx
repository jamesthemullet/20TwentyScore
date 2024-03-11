import React, { createContext, useContext, useState } from 'react';

const maxOvers = 20;

type OversContextType = {
  currentExtrasInThisOver: number;
  setCurrentExtrasInThisOver: (extras: number) => void;
  currentBallInThisOver: number;
  setCurrentBallInThisOver: () => void;
  currentOver: number;
  setCurrentOver: () => void;
};

type OversProviderProps = {
  children: React.ReactNode;
};

export const OversContext = createContext<OversContextType>({
  currentExtrasInThisOver: 0,
  setCurrentExtrasInThisOver: (extras) => {
    console.log('Initial setCurrentExtrasInOver called with', extras);
  },
  currentBallInThisOver: 1,
  setCurrentBallInThisOver: () => {
    console.log('Initial setCurrentBallInThisOver called');
  },
  currentOver: 1,
  setCurrentOver: () => {
    console.log('Initial setCurrentOver called');
  }
});

export const useOvers = () => useContext(OversContext);

export const OversProvider: React.FC<OversProviderProps> = ({ children }) => {
  const [currentExtrasInThisOver, setCurrentExtrasInOverState] = useState(0);

  const setCurrentExtrasInThisOver = (extras: number) => {
    setCurrentExtrasInOverState(currentExtrasInThisOver + extras);
  };

  const [currentBallInThisOver, setCurrentBallInOverState] = useState(1);

  console.log(10, currentBallInThisOver);

  const setCurrentBallInThisOver = () => {
    setCurrentBallInOverState(currentBallInThisOver + 1);
  };

  const [currentOver, setCurrentOverState] = useState(1);

  const setCurrentOver = () => {
    setCurrentOverState(currentOver + 1);
  };

  return (
    <OversContext.Provider
      value={{
        currentExtrasInThisOver,
        setCurrentExtrasInThisOver,
        currentBallInThisOver,
        setCurrentBallInThisOver,
        currentOver,
        setCurrentOver
      }}>
      {children}
    </OversContext.Provider>
  );
};
