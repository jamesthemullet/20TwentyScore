import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Draft from '../pages/create';
import { SessionContextValue, useSession } from 'next-auth/react';
import { NextRouter, useRouter } from 'next/router';
import Router from 'next/router';

global.fetch = jest.fn();

const useRouterMock = useRouter as jest.MockedFunction<typeof useRouter>;

jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  useRouter: jest.fn(),
  push: jest.fn()
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

describe('Create page', () => {
  beforeEach(() => {
    useRouterMock.mockReturnValue({
      basePath: '',
      isLocaleDomain: false,
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      isFallback: false,
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn()
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
  it('should render a Create page successfully', () => {
    render(<Draft />);

    const pageHeading = screen.getByRole('heading', { name: /new draft/i });
    expect(pageHeading).toBeVisible();
  });

  it('should submit the form successfully', async () => {
    render(<Draft />);

    const titleInput = screen.getByPlaceholderText('Title');
    const contentInput = screen.getByPlaceholderText('Content');
    const createButton = screen.getByRole('button', { name: 'Create' });

    expect(titleInput).toBeVisible();
    expect(contentInput).toBeVisible();
    expect(createButton).toBeVisible();

    await waitFor(() => {
      titleInput.focus();
      titleInput.blur();
      contentInput.focus();
      contentInput.blur();
    });

    // expect(titleInput).toHaveFocus();
    // expect(contentInput).toHaveFocus();

    await waitFor(() => {
      titleInput.focus();
      titleInput.blur();
      contentInput.focus();
      contentInput.blur();
    });

    expect(titleInput).not.toHaveFocus();
    expect(contentInput).not.toHaveFocus();
  });

  it('should cancel the form submission on click of cancel', async () => {
    render(<Draft />);

    const cancelButton = screen.getByRole('link', { name: /or cancel/i });

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(Router.push).toHaveBeenCalledWith('/');
    });
  });

  it('should submit the form successfully', async () => {
    render(<Draft />);

    const titleInput = screen.getByPlaceholderText('Title');
    const contentInput = screen.getByPlaceholderText('Content');

    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(contentInput, { target: { value: 'Test Content' } });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Title',
          content: 'Test Content',
          session: {
            user: {
              email: 'test@example.com'
            },
            expires: ''
          }
        })
      });
    });

    await waitFor(() => {
      expect(Router.push).toHaveBeenCalledWith('/drafts');
    });
  });

  it('should handle form submission error', async () => {
    const error = new Error('An error occurred');
    (fetch as jest.Mock).mockRejectedValueOnce(error);
    const errorSpy = jest.spyOn(console, 'error');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    errorSpy.mockImplementation(() => {});

    render(<Draft />);

    const titleInput = screen.getByPlaceholderText('Title');
    const contentInput = screen.getByPlaceholderText('Content');

    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(contentInput, { target: { value: 'Test Content' } });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Title',
          content: 'Test Content',
          session: {
            user: {
              email: 'test@example.com'
            },
            expires: ''
          }
        })
      });
    });

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(error);
    });
  });
});
