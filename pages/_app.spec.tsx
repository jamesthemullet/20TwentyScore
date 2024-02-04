import { act, render, screen } from '@testing-library/react';
import React from 'react';
import App from './_app';

global.fetch = require('jest-fetch-mock');

type AppProps = {
  Component: React.ComponentType;
  pageProps: Record<string, any>;
  router: any;
};

const pageContent = 'test content';

describe('App tests', () => {
  it('should create an app', async () => {
    const props: AppProps = {
      Component: () => <div>{pageContent}</div>,
      pageProps: {},
      router: {}
    };

    await act(async () => {
      render(<App {...props} />);
    });
    expect(screen.queryByText('test content')).toBeInTheDocument();
  });
});
