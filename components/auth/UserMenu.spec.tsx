import { fireEvent, render, screen } from '@testing-library/react';
import UserMenu from './UserMenu';

const mockUseSession = jest.fn();
const mockSignOut = jest.fn();

jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/' }),
}));

describe('UserMenu', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders nothing while the session is loading', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' });
    const { container } = render(<UserMenu />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a Sign In link when there is no session', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<UserMenu />);
    const link = screen.getByRole('link', { name: /sign in/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/auth/signin');
  });

  it('renders an avatar button with initials when authenticated without an image', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Alice Smith', image: null } },
      status: 'authenticated',
    });
    render(<UserMenu />);
    const btn = screen.getByRole('button', { name: /user menu/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('AS');
  });

  it('shows the dropdown menu when the avatar button is clicked', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Bob Jones', image: null } },
      status: 'authenticated',
    });
    render(<UserMenu />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /account/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument();
  });

  it('closes the dropdown when clicking outside the menu', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Bob Jones', image: null } },
      status: 'authenticated',
    });
    render(<UserMenu />);
    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('calls signOut with callbackUrl "/" when Sign out is clicked', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Alice Smith', image: null } },
      status: 'authenticated',
    });
    render(<UserMenu />);
    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /sign out/i }));
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });
});
