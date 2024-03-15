import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Drafts, { getServerSideProps } from '../pages/drafts';
import { GetServerSidePropsContext } from 'next';
import { SessionContextValue, getSession, useSession } from 'next-auth/react';
import { NextRouter, useRouter } from 'next/router';

const useRouterMock = useRouter as jest.MockedFunction<typeof useRouter>;

jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  useRouter: jest.fn()
}));

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
  useSession: jest.fn()
}));

const prisma = {
  post: {
    findMany: jest.fn().mockResolvedValue([
      {
        id: '1',
        title: 'Mocked Draft 1',
        content: 'Test content',
        author: { name: 'John Doe', email: 'john@example.com' },
        published: false
      },
      {
        id: '2',
        title: 'Mocked Draft 2',
        content: 'Test content',
        author: { name: 'James Winfeld', email: 'james@example.com' },
        published: false
      }
    ])
  }
};

describe('Drafts page', () => {
  beforeEach(() => {
    useRouterMock.mockReturnValue({
      basePath: '',
      isLocaleDomain: false,
      push: async () => true,
      replace: async () => true,
      reload: () => null,
      back: () => null,
      prefetch: async () => null,
      beforePopState: () => null,
      isFallback: false,
      events: {
        on: () => null,
        off: () => null,
        emit: () => null
      },
      isReady: true,
      isPreview: false
    } as unknown as NextRouter);

    const session: SessionContextValue<boolean> = {
      update: jest.fn(),
      data: {
        user: {
          email: 'test@example.com'
        },
        expires: ''
      },
      status: 'authenticated'
    };
    const getSessionUser = {
      user: {
        email: 'test@example.com'
      },
      expires: ''
    };

    (getSession as jest.Mock).mockReturnValue(getSessionUser);
    (useSession as jest.Mock).mockReturnValue(session);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should render the drafts page', async () => {
    const drafts = [
      {
        id: '1',
        title: 'Mocked Draft 1',
        content: 'Test content',
        author: { name: 'John Doe', email: 'john@example.com' },
        published: false
      },
      {
        id: '2',
        title: 'Mocked Draft 2',
        content: 'Test content',
        author: { name: 'James Winfeld', email: 'james@example.com' },
        published: false
      }
    ];
    prisma.post.findMany = jest.fn().mockResolvedValue(drafts);

    const res = {} as GetServerSidePropsContext;
    const req = {};

    await getServerSideProps({ req, res } as any);

    render(<Drafts drafts={drafts} />);
    await waitFor(() => {
      expect(screen.getByText('Mocked Draft 1')).toBeVisible();
      expect(screen.getByText('Mocked Draft 2')).toBeVisible();
      expect(
        screen.queryByText('You need to be authenticated to view this page.')
      ).not.toBeInTheDocument();
    });
  });

  it('should render empty drafts page if no session', async () => {
    (getSession as jest.Mock).mockReturnValue(null);

    const res = {
      statusCode: undefined
    } as unknown as GetServerSidePropsContext;
    const req = {};

    const response = await getServerSideProps({ req, res } as any);

    render(<Drafts drafts={[]} />);
    await waitFor(() => {
      expect((response as { props: { drafts: any[] } }).props.drafts).toEqual([]);
    });
  });

  it('should render empty drafts page if user is invalid', async () => {
    const invalidUser: SessionContextValue<boolean> = {
      update: jest.fn(),
      data: {
        expires: ''
      },
      status: 'authenticated'
    };

    (getSession as jest.Mock).mockReturnValue(invalidUser);

    const res = {
      statusCode: undefined
    } as unknown as GetServerSidePropsContext;
    const req = {};

    const response = await getServerSideProps({ req, res } as any);

    render(<Drafts drafts={[]} />);
    await waitFor(() => {
      expect((response as { props: { drafts: any[] } }).props.drafts).toEqual([]);
    });
  });

  it('should render empty drafts page if user not authenticated', async () => {
    (useSession as jest.Mock).mockReturnValue({ session: null });

    render(<Drafts drafts={[]} />);

    await waitFor(() => {
      expect(screen.queryByText('Mocked Draft 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Mocked Draft 2')).not.toBeInTheDocument();
      expect(screen.getByText('You need to be authenticated to view this page.')).toBeVisible();
    });
  });
});
