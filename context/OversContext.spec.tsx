import { render, screen } from '@testing-library/react';
import { OversContext, useOvers, OversProvider } from './OversContext';
import React from 'react';

describe('OversProvider', () => {
  describe('setOvers', () => {
    it('should set the current amount of extras in the current over', () => {
      const MockChildComponent = () => {
        const { currentExtrasInThisOver, setCurrentExtrasInThisOver } = useOvers();

        React.useEffect(() => {
          setCurrentExtrasInThisOver(1);
        }, []);

        return <div>extras: {currentExtrasInThisOver}</div>;
      };
      render(
        <OversProvider>
          <MockChildComponent />
        </OversProvider>
      );
      expect(screen.queryByText('extras: 1')).toBeInTheDocument();
    });

    it('should set ball in this current over', () => {
      const MockChildComponent = () => {
        const { currentBallInThisOver, setCurrentBallInThisOver } = useOvers();

        React.useEffect(() => {
          setCurrentBallInThisOver(null);
        }, []);

        return <div>Current ball: {currentBallInThisOver}</div>;
      };
      render(
        <OversProvider>
          <MockChildComponent />
        </OversProvider>
      );
      expect(screen.queryByText('Current ball: 2')).toBeInTheDocument();
    });

    it('should set over', () => {
      const MockChildComponent = () => {
        const { currentOver, incrementCurrentOver } = useOvers();

        React.useEffect(() => {
          incrementCurrentOver();
        }, []);

        return <div>Current over: {currentOver}</div>;
      };
      render(
        <OversProvider>
          <MockChildComponent />
        </OversProvider>
      );
      expect(screen.getByText('Current over: 2')).toBeInTheDocument();
    });
  });

  it('should process pointless initial setOvers correctly', () => {
    const logSpy = jest.spyOn(console, 'log');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    logSpy.mockImplementation(() => {});

    const TestComponent = () => {
      const {
        setCurrentExtrasInThisOver,

        setCurrentBallInThisOver,

        incrementCurrentOver
      } = React.useContext(OversContext);

      setCurrentExtrasInThisOver(1);
      setCurrentBallInThisOver(null);
      incrementCurrentOver();

      return null;
    };

    render(<TestComponent />);

    expect(logSpy).toHaveBeenCalledTimes(3);

    logSpy.mockRestore();
  });
});
