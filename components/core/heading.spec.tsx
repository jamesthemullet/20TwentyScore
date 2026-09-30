import { render, screen } from '@testing-library/react';
import { StyledHeading2 } from './heading';

describe('StyledHeading2', () => {
  it('renders its children inside an h2 element', () => {
    render(<StyledHeading2>Match Summary</StyledHeading2>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Match Summary' });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');
  });
});
