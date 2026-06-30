import { render, screen } from '@testing-library/react';
import { MilestoneToast } from './MilestoneToast';

describe('MilestoneToast', () => {
  it('renders the message and exposes the correct ARIA role and attributes', () => {
    render(<MilestoneToast message="WICKET!" accent="#b83320" />);
    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent('WICKET!');
    expect(toast).toHaveAttribute('aria-live', 'polite');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
  });
});
