import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Scoring from './scoring';
import { after } from 'node:test';

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
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should render a Scoring component successfully', () => {
    render(<Scoring {...ScoringProps} />);
    const headingElement = screen.getByRole('heading', { level: 2 });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveTextContent('Scoring');

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(9);
  });

  it('should call onScoreUpdate and onOverUpdate when the 0 runs button is clicked', () => {
    render(<Scoring {...ScoringProps} />);
    const button = screen.getByRole('button', { name: '0' });

    act(() => {
      fireEvent.click(button);
    });
    expect(ScoringProps.onScoreUpdate).toHaveBeenCalledTimes(1);
    expect(ScoringProps.onOverUpdate).toHaveBeenCalledTimes(1);
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

  it('should not call onScoreUpdate if the 1+ button is clicked', () => {
    render(<Scoring {...ScoringProps} />);
    const button = screen.getByRole('button', { name: /1\+/i });
    act(() => {
      fireEvent.click(button);
    });
    expect(ScoringProps.onScoreUpdate).not.toHaveBeenCalled();
  });

  it('should enable next ball button when 1+ button is clicked', () => {
    render(<Scoring {...ScoringProps} />);
    const button = screen.getByRole('button', { name: /1\+/i });

    act(() => {
      fireEvent.click(button);
    });

    const nextBallButton = screen.getByRole('button', { name: 'Next Ball' });
    expect(nextBallButton).not.toBeDisabled();
  });

  it('should call onScoreUpdate when next ball is clicked, and send the runs stored in state', () => {
    render(<Scoring {...ScoringProps} />);
    const button = screen.getByRole('button', { name: /1\+/i });

    act(() => {
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
    });

    const nextBallButton = screen.getByRole('button', { name: 'Next Ball' });

    act(() => {
      fireEvent.click(nextBallButton);
    });

    expect(ScoringProps.onScoreUpdate).toHaveBeenCalledWith(1, 0, 3, 'Next Ball');
  });
});
