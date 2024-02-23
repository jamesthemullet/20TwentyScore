import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './footer';

describe('Footer Component', () => {
  it('should render a Footer component successfully', () => {
    render(<Footer />);
    expect(screen.queryByText('This is footer')).toBeVisible();
  });
});
