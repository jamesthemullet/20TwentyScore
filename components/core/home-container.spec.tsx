import { render, screen } from '@testing-library/react';
import { HomeContainer } from './home-container';

describe('HomeContainer', () => {
  it('renders its children inside a div element', () => {
    render(
      <HomeContainer>
        <p>Welcome</p>
      </HomeContainer>
    );
    const text = screen.getByText('Welcome');
    expect(text).toBeInTheDocument();
    expect(text.parentElement?.tagName).toBe('DIV');
  });
});
