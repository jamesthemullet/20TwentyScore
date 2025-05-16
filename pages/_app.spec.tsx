// import { act, render, screen } from '@testing-library/react';
// import React from 'react';
// import App from './_app';

// jest.mock('@mantine/core', () => {
//   const originalModule = jest.requireActual('@mantine/core');

//   type MantineProviderProps = React.PropsWithChildren<unknown>;

//   return {
//     __esModule: true,
//     ...originalModule,
//     MantineProvider: ({ children }: MantineProviderProps) => <div>{children}</div>
//   };
// });

// global.fetch = require('jest-fetch-mock');

// type AppProps = {
//   Component: React.ComponentType;
//   pageProps: Record<string, any>;
//   router: any;
// };

// const pageContent = 'test content';

// describe('App tests', () => {
//   it('should create an app', async () => {
//     const props: AppProps = {
//       Component: () => <div>{pageContent}</div>,
//       pageProps: { session: {} },
//       router: {}
//     };

//     await act(async () => {
//       render(<App {...props} />);
//     });
//     expect(screen.queryByText('test content')).toBeInTheDocument();
//   });
// });
