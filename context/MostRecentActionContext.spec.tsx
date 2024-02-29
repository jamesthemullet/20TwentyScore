import { render, screen } from '@testing-library/react';
import {
  MostRecentActionContext,
  useMostRecentAction,
  MostRecentActionProvider
} from './MostRecentActionContext';
import React from 'react';

describe('RecentActionProvider', () => {
  describe('setMostRecentAction', () => {
    it('should process setMostRecentAction correctly when player has scored runs', () => {
      const MockChildComponent = () => {
        const { mostRecentAction, setMostRecentAction } = useMostRecentAction();

        React.useEffect(() => {
          setMostRecentAction({ runs: 1, action: null });
        }, []);

        return <div>Runs: {mostRecentAction.runs}</div>;
      };
      render(
        <MostRecentActionProvider>
          <MockChildComponent />
        </MostRecentActionProvider>
      );
      expect(screen.queryByText('Runs: 1')).toBeVisible();
    });

    it('should process setMostRecentAction correctly when player has been out', () => {
      const MockChildComponent = () => {
        const { mostRecentAction, setMostRecentAction } = useMostRecentAction();

        React.useEffect(() => {
          setMostRecentAction({ runs: 0, action: 'Wicket' });
        }, []);

        return <div>Action: {mostRecentAction.action}</div>;
      };
      render(
        <MostRecentActionProvider>
          <MockChildComponent />
        </MostRecentActionProvider>
      );
      expect(screen.queryByText('Action: Wicket')).toBeVisible();
    });
  });

  it('should process pointless initial setMostRecentAction correctly', () => {
    const logSpy = jest.spyOn(console, 'log');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    logSpy.mockImplementation(() => {});

    const TestComponent = () => {
      const { setMostRecentAction } = React.useContext(MostRecentActionContext);

      setMostRecentAction({ runs: 1, action: null });

      return null;
    };

    render(<TestComponent />);

    expect(logSpy).toHaveBeenCalledWith('Initial setMostRecentAction called with', {
      action: null,
      runs: 1
    });

    logSpy.mockRestore();
  });
});
