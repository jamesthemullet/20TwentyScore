import React from 'react';
import { Player } from './player';
import { act, fireEvent, render, screen } from '@testing-library/react';

describe('Player', () => {
  it('should render a Player component successfully', () => {
    const props = {
      index: 1,
      runs: 10,
      wicketsTaken: 0,
      currentStriker: true,
      allActions: [],
      currentNonStriker: false,
      status: 'Not out'
    };
    render(<Player {...props} />);
    expect(screen.getByText('Player 2')).toBeVisible();
    expect(screen.getByText('Runs: 10')).toBeVisible();
    expect(screen.getAllByText('Not out')[0]).toBeVisible();
    expect(screen.getByRole('button', { name: 'Edit player' })).toBeVisible();
  });

  it('should show a textbox and save button, upon clicking the edit button, and hide the edit button', () => {
    const props = {
      index: 1,
      runs: 10,
      wicketsTaken: 0,
      currentStriker: true,
      allActions: [],
      currentNonStriker: false,
      status: 'Not out'
    };
    render(<Player {...props} />);
    const editButton = screen.getByRole('button', { name: 'Edit player' });
    act(() => {
      editButton.click();
    });
    expect(screen.getByRole('textbox')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save player' })).toBeVisible();
    expect(editButton).not.toBeVisible();
  });

  it('should update the player name, upon clicking the save button', () => {
    const props = {
      index: 1,
      runs: 10,
      wicketsTaken: 0,
      currentStriker: true,
      allActions: [],
      currentNonStriker: false,
      status: 'Not out'
    };
    render(<Player {...props} />);
    const editButton = screen.getByRole('button', { name: 'Edit player' });
    act(() => {
      editButton.click();
    });
    const textbox = screen.getByRole('textbox');
    act(() => {
      fireEvent.change(textbox, { target: { value: 'Player La La La' } });
    });
    expect(textbox).toHaveValue('Player La La La');
    const saveButton = screen.getByRole('button', { name: 'Save player' });
    act(() => {
      saveButton.click();
    });
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByText('Player La La La')).toBeVisible();
  });

  it('should show current striker icon if player is batting', () => {
    const props = {
      index: 1,
      runs: 10,
      wicketsTaken: 0,
      currentStriker: true,
      allActions: [],
      currentNonStriker: false,
      status: 'Not out'
    };
    render(<Player {...props} />);
    expect(screen.getByTitle('Current striker')).toBeVisible();
  });

  it('should not show current striker icon if player is not batting', () => {
    const props = {
      index: 3,
      runs: 0,
      wicketsTaken: 0,
      currentStriker: false,
      allActions: [],
      currentNonStriker: false,
      status: 'Not out'
    };
    render(<Player {...props} />);
    expect(screen.queryByTitle('logo')).not.toBeInTheDocument();
  });

  it('should show current non striker icon if player is not batting', () => {
    const props = {
      index: 3,
      runs: 0,
      wicketsTaken: 0,
      currentStriker: false,
      allActions: [],
      currentNonStriker: true,
      status: 'Not out'
    };
    render(<Player {...props} />);
    expect(screen.getByTitle('Current non striker')).toBeVisible();
  });
});
