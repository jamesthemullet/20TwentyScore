import { fireEvent, render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import UserMenu from './UserMenu';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

const mockUseSession = useSession as unknown as jest.Mock;

describe('UserMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a Sign In link when not authenticated', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<UserMenu />);
    expect(screen.getByRole('link', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('renders nothing while the session is loading', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' });
    const { container } = render(<UserMenu />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows user initials in the avatar button when authenticated without an image', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'James Smith', email: 'j@example.com', image: null }, expires: '' },
      status: 'authenticated',
    });
    render(<UserMenu />);
    const avatar = screen.getByRole('button', { name: 'User menu' });
    expect(avatar).toHaveTextContent('JS');
  });

  it('opens a dropdown with navigation links when the avatar is clicked', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'James Smith', email: 'j@example.com', image: null }, expires: '' },
      status: 'authenticated',
    });
    render(<UserMenu />);
    fireEvent.click(screen.getByRole('button', { name: 'User menu' }));
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });
});
