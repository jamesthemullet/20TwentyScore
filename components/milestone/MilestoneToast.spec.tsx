import { render, screen } from '@testing-library/react';
import { MilestoneToast } from './MilestoneToast';

describe('MilestoneToast', () => {
  it('renders the message text with correct ARIA role and live-region attributes', () => {
    render(<MilestoneToast message="WICKET!" accent="#b83320" />);
    const toast = screen.getByRole('status');
    expect(toast).toBeInTheDocument();
    expect(screen.getByText('WICKET!')).toBeInTheDocument();
    expect(toast).toHaveAttribute('aria-live', 'polite');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
  });
});
