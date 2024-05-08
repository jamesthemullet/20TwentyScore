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

    it('should reset the current amount of extras in the current over, if called with reset', () => {
      const MockChildComponent = () => {
        const { currentExtrasInThisOver, setCurrentExtrasInThisOver } = useOvers();

        React.useEffect(() => {
          setCurrentExtrasInThisOver('reset');
        }, []);

        return <div>extras: {currentExtrasInThisOver}</div>;
      };
      render(
        <OversProvider>
          <MockChildComponent />
        </OversProvider>
      );
      expect(screen.queryByText('extras: 0')).toBeInTheDocument();
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
        const { currentOver, setCurrentOvers } = useOvers();

        React.useEffect(() => {
          setCurrentOvers(undefined);
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

    it('should reset overs', () => {
      const MockChildComponent = () => {
        const {
          currentExtrasInThisOver,
          currentOver,
          currentBallInThisOver,
          setCurrentExtrasInThisOver,
          setCurrentBallInThisOver,
          setCurrentOvers,
          resetOvers
        } = useOvers();

        React.useEffect(() => {
          setCurrentOvers(2);
          setCurrentBallInThisOver(6);
          setCurrentExtrasInThisOver(2);
          resetOvers();
        }, []);

        return (
          <>
            <div>Current extras: {currentExtrasInThisOver}</div>
            <div>Current over: {currentOver}</div>
            <div>Current ball: {currentBallInThisOver}</div>
          </>
        );
      };
      render(
        <OversProvider>
          <MockChildComponent />
        </OversProvider>
      );
      expect(screen.queryByText('Current extras: 0')).toBeInTheDocument();
      expect(screen.queryByText('Current over: 1')).toBeInTheDocument();
      expect(screen.queryByText('Current ball: 1')).toBeInTheDocument();
    });
  });

  it('should process pointless initialising functions correctly', () => {
    const logSpy = jest.spyOn(console, 'log');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    logSpy.mockImplementation(() => {});

    const TestComponent = () => {
      const { setCurrentExtrasInThisOver, setCurrentBallInThisOver, setCurrentOvers, resetOvers } =
        React.useContext(OversContext);

      setCurrentExtrasInThisOver(1);
      setCurrentBallInThisOver(null);
      setCurrentOvers(undefined);
      resetOvers();

      return null;
    };

    render(<TestComponent />);

    expect(logSpy).toHaveBeenCalledTimes(4);

    logSpy.mockRestore();
  });
});
