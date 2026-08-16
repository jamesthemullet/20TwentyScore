import { fireEvent, render, screen } from '@testing-library/react';
import SignIn from '../../pages/auth/signin';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/auth/signin', query: {}, asPath: '/auth/signin', push: jest.fn() }),
}));

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: jest.fn().mockReturnValue({ data: null, status: 'unauthenticated' }),
}));

const { signIn } = jest.requireMock<{ signIn: jest.Mock }>('next-auth/react');

describe('SignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the 20Twenty Score page title', () => {
    render(<SignIn />);
    expect(screen.getByRole('heading', { name: /20twenty score/i })).toBeInTheDocument();
  });

  it('calls signIn with google provider when the button is clicked', () => {
    render(<SignIn />);
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
  });
});
