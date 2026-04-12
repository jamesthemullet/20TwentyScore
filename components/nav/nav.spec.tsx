import React from 'react';
import Nav from './nav';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { matchers } from '@emotion/jest';

expect.extend(matchers);

describe('Nav Component', () => {
  it('should render navigation links', () => {
    render(<Nav />);
    expect(screen.getByText('Home')).toBeVisible();
    expect(screen.getByText('Teams')).toBeVisible();
    expect(screen.getByText('Scoreboard')).toBeVisible();
  });

  it('should link to the correct pages', () => {
    render(<Nav />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Teams' })).toHaveAttribute('href', '/teams');
    expect(screen.getByRole('link', { name: 'Scoreboard' })).toHaveAttribute('href', '/scoreboard');
  });

  it('should toggle the dropdown menu when the burger button is clicked', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 150
    });
    window.dispatchEvent(new Event('resize'));
    render(<Nav />);

    const expandedMenu = screen.getByLabelText('Expanded Menu');
    expect(expandedMenu).not.toHaveClass('open');

    act(() => {
      fireEvent.click(screen.getByLabelText('Navigation Menu'));
    });

    expect(expandedMenu).toHaveClass('open');
  });
});
