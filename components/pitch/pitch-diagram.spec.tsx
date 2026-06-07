import { render, screen } from '@testing-library/react';
import PitchDiagram from './pitch-diagram';

describe('PitchDiagram', () => {
  it('renders an svg with the cricket ground aria-label', () => {
    render(<PitchDiagram />);
    expect(screen.getByLabelText('Cricket ground diagram')).toBeInTheDocument();
  });

  it('renders an svg element', () => {
    const { container } = render(<PitchDiagram />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 220 220');
  });
});
