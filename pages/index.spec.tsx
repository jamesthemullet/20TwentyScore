import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Index, { getStaticProps } from './index';
import { NextRouter, useRouter } from 'next/router';
import { SessionContextValue, useSession } from 'next-auth/react';
import Blog from './index';
import prisma from '../lib/prisma';

const useRouterMock = useRouter as jest.MockedFunction<typeof useRouter>;

jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  useRouter: jest.fn()
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    post: {
      findMany: jest.fn()
    }
  }))
}));

const mockPosts = [
  {
    id: '1',
    title: 'Mocked Post 1',
    author: { name: 'John Doe', email: 'john@example.com' },
    content: 'Test content',
    published: true
  },
  {
    id: '2',
    title: 'Mocked Post 2',
    author: { name: 'Jane Smith', email: 'jane@example.com' },
    content: 'Test content',
    published: true
  }
];

describe('Index page', () => {
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
    (useSession as jest.Mock).mockReturnValue(session);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page', () => {
    render(<Blog feed={[]} />);
    const headingElement = screen.getByRole('heading', { level: 1 });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveTextContent('20Twenty Score');
  });

  it('should retrieve posts from Prisma', async () => {
    // Mock the Prisma query method
    prisma.post.findMany = jest.fn().mockResolvedValue(mockPosts);

    // Call getStaticProps
    const { props } = (await getStaticProps({})) as { props: { feed: typeof mockPosts } };

    // Check if the props object contains the expected feed
    expect(props).toHaveProperty('feed', mockPosts);
  });

  it('should render posts', async () => {
    // Mock the Prisma query method
    prisma.post.findMany = jest.fn().mockResolvedValue(mockPosts);

    // Render the page
    render(<Index feed={mockPosts} />);

    // Wait for the posts to be rendered
    await waitFor(() => {
      const postElements = screen.getAllByRole('article');
      expect(postElements).toHaveLength(2);
    });
  });
});
