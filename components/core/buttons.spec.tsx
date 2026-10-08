import { render, screen } from '@testing-library/react';
import { PrimaryButton, SecondaryButton, SquareButton } from './buttons';

describe('core buttons', () => {
  it('renders PrimaryButton as a button element with its children', () => {
    render(<PrimaryButton>Start</PrimaryButton>);
    const button = screen.getByRole('button', { name: 'Start' });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders PrimaryButton disabled when passed the disabled prop', () => {
    render(<PrimaryButton disabled>Start</PrimaryButton>);
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();
  });

  it('renders SecondaryButton as a button element with its children', () => {
    render(<SecondaryButton>Cancel</SecondaryButton>);
    const button = screen.getByRole('button', { name: 'Cancel' });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders SecondaryButton disabled when passed the disabled prop', () => {
    render(<SecondaryButton disabled>Cancel</SecondaryButton>);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('renders SquareButton as a button element with its children', () => {
    render(<SquareButton>1</SquareButton>);
    const button = screen.getByRole('button', { name: '1' });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders SquareButton disabled when passed the disabled prop', () => {
    render(<SquareButton disabled>1</SquareButton>);
    expect(screen.getByRole('button', { name: '1' })).toBeDisabled();
  });
});
