import React from 'react';
import Team from './team';
import { act, fireEvent, render, screen } from '@testing-library/react';

const teamProps = {
  teamIndex: 1,
  name: 'Team 1',
  players: [
    {
      index: 0,
      name: 'Player 1',
      runs: 10,
      isBatting: true,
      allActions: ['', '', '', '', '', 'Wicket']
    },
    {
      index: 1,
      name: 'Player 2',
      runs: 20,
      isBatting: false,
      allActions: ['', '', '', '', '']
    },
    {
      index: 2,
      name: 'Player 3',
      runs: 30,
      isBatting: false,
      allActions: []
    },
    { index: 3, name: 'Player 4', runs: 40, isBatting: false, allActions: [] },
    { index: 4, name: 'Player 5', runs: 50, isBatting: false, allActions: [] },
    { index: 5, name: 'Player 6', runs: 60, isBatting: false, allActions: [] },
    { index: 6, name: 'Player 7', runs: 70, isBatting: false, allActions: [] },
    { index: 7, name: 'Player 8', runs: 80, isBatting: false, allActions: [] },
    { index: 8, name: 'Player 9', runs: 90, isBatting: false, allActions: [] },
    { index: 9, name: 'Player 10', runs: 100, isBatting: false, allActions: [] },
    { index: 10, name: 'Player 11', runs: 110, isBatting: false, allActions: [] }
  ],
  currentStriker: {
    index: 1,
    isBatting: true
  },
  currentNonStriker: {
    index: 2,
    isBatting: false
  },
  mostRecentAction: {
    runs: 4,
    action: 'Four'
  }
};

describe('Team Component', () => {
  it('should render a Team component successfully', () => {
    render(<Team {...teamProps} />);
    expect(screen.getByText('Team 1')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Edit Team Name' })).toBeVisible();
  });

  it('should show a textbox and save button, upon clicking the edit button, and hide the edit button', () => {
    render(<Team {...teamProps} />);
    const editButton = screen.getByRole('button', { name: 'Edit Team Name' });
    act(() => {
      editButton.click();
    });
    expect(screen.getByRole('textbox')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save Team Name' })).toBeVisible();
    expect(editButton).not.toBeVisible();
  });

  it('should update the player name, upon clicking the save button', () => {
    render(<Team {...teamProps} />);
    const editButton = screen.getByRole('button', { name: 'Edit Team Name' });
    act(() => {
      editButton.click();
    });
    const textbox = screen.getByRole('textbox', { name: 'Edit team name' });
    act(() => {
      fireEvent.change(textbox, { target: { value: 'Team La La La' } });
    });
    expect(textbox).toHaveValue('Team La La La');
    const saveButton = screen.getByRole('button', { name: 'Save Team Name' });
    act(() => {
      saveButton.click();
    });
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByText('Team La La La')).toBeVisible();
  });
});
