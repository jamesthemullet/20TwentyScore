import React from 'react';
import Post from './post';
import { fireEvent, render } from '@testing-library/react';
import Router from 'next/router';

jest.mock('next/router', () => ({
  push: jest.fn()
}));

describe('Post', () => {
  it('should render the post', () => {
    const post = {
      id: '1',
      title: 'My first post',
      content: 'This is my first post!',
      author: {
        name: 'Author 1',
        email: 'person@example.com'
      },
      published: true
    };
    const { getByText } = render(<Post post={post} />);
    expect(getByText('My first post')).toBeInTheDocument();
    expect(getByText('By Author 1')).toBeInTheDocument();
    expect(getByText('This is my first post!')).toBeInTheDocument();
  });

  it('should render the post with unknown author', () => {
    const post = {
      id: '1',
      title: 'My first post',
      content: 'This is my first post!',
      author: null,
      published: true
    };
    const { getByText } = render(<Post post={post} />);
    expect(getByText('My first post')).toBeInTheDocument();
    expect(getByText('By Unknown author')).toBeInTheDocument();
    expect(getByText('This is my first post!')).toBeInTheDocument();
  });

  it('should render the post when clicked', () => {
    const post = {
      id: '123',
      title: 'Test Post',
      author: {
        name: 'Test Author',
        email: 'test@example.com'
      },
      content: '<p>This is a test post</p>',
      published: true
    };
    const { getByText } = render(<Post post={post} />);

    fireEvent.click(getByText(post.title));

    expect(Router.push).toHaveBeenCalledWith('/p/[id]', `/p/${post.id}`);
  });
});
