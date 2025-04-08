import React from 'react';
import Team from './team';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { GameScoreProvider } from '../../context/GameScoreContext';

const teamProps = {
  teamIndex: 1
};

describe('Team Component', () => {
  it('should render a Team component successfully', () => {
    render(<Team {...teamProps} />);
    expect(screen.getByText('Team 1')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Edit Team Name' })).toBeVisible();
  });

  it('should render a player component successfully', () => {
    render(
      <GameScoreProvider>
        <Team {...teamProps} />
      </GameScoreProvider>
    );
    expect(screen.getByText('Player 1')).toBeVisible();
    expect(screen.getByText('Player 2')).toBeVisible();
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
