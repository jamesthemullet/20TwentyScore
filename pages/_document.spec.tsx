import { render } from '@testing-library/react';
import MyDocument from './_document';
import React from 'react';

jest.mock('next/document', () => ({
  __esModule: true,
  ...jest.requireActual('next/document'),
  Html: jest.fn().mockImplementation(() => ({
    render() {
      return React.createElement('html', { 'data-testid': 'html' });
    }
  }))
}));

describe('Document Component', () => {
  const documentProps = {} as any;
  it('should render without errors', () => {
    const rendered = render(<MyDocument {...documentProps} />);
    expect(rendered).toBeTruthy();
  });

  it('should have html element with data-testid', () => {
    const { getByTestId } = render(<MyDocument {...documentProps} />);
    const htmlElement = getByTestId('html');
    expect(htmlElement).toBeInTheDocument();
  });
});
