import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { Player } from './player';
import { act, fireEvent, render, screen } from '@testing-library/react';

describe('Player', () => {
  it('should render a Player component successfully', () => {
    const props = {
      index: 1,
      runs: 10,
      isBatting: true
    };
    render(<Player {...props} />);
    expect(screen.getByText('Player 1')).toBeVisible();
    expect(screen.getByText('Runs: 10')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeVisible();
  });

  it('should show a textbox and save button, upon clicking the edit button, and hide the edit button', () => {
    const props = {
      index: 1,
      runs: 10,
      isBatting: true
    };
    render(<Player {...props} />);
    const editButton = screen.getByRole('button', { name: 'Edit' });
    act(() => {
      editButton.click();
    });
    expect(screen.getByRole('textbox')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(editButton).not.toBeVisible();
  });

  it('should update the player name, upon clicking the save button', () => {
    const props = {
      index: 1,
      runs: 10,
      isBatting: true
    };
    render(<Player {...props} />);
    const editButton = screen.getByRole('button', { name: 'Edit' });
    act(() => {
      editButton.click();
    });
    const textbox = screen.getByRole('textbox');
    act(() => {
      fireEvent.change(textbox, { target: { value: 'Player La La La' } });
    });
    expect(textbox).toHaveValue('Player La La La');
    const saveButton = screen.getByRole('button', { name: 'Save' });
    act(() => {
      saveButton.click();
    });
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByText('Player La La La')).toBeVisible();
  });
});