import React from 'react';
import { render, screen } from '@testing-library/react';
import Scoring from './scoring';

const ScoringProps = {
  onScoreUpdate: jest.fn(),
  onOverUpdate: jest.fn(),
  currentStriker: {
    index: 0,
    name: 'Player 1',
    runs: 0,
    isBatting: true,
    isOnTheCrease: true,
    isOut: false,
    allActions: []
  }
};

describe('Scoring Component', () => {
  it('should render a Scoring component successfully', () => {
    render(<Scoring {...ScoringProps} />);
    const headingElement = screen.getByRole('heading', { level: 2 });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveTextContent('Scoring');

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(9);
  });

  it('should call onScoreUpdate and onOverUpdate when a button is clicked', () => {
    render(<Scoring {...ScoringProps} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      button.click();
    });
    expect(ScoringProps.onScoreUpdate).toHaveBeenCalledTimes(8);
    expect(ScoringProps.onOverUpdate).toHaveBeenCalledTimes(8);
  });

  it('should set next ball action to disabled by default', () => {
    render(<Scoring {...ScoringProps} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      if (button.textContent === 'Next Ball') {
        expect(button).toBeDisabled();
      }
    });
  });
});
