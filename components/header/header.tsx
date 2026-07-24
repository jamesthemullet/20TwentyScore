import styled from '@emotion/styled';
import Link from 'next/link';
import type React from 'react';
import Nav from '../nav/nav';

const Header: React.FC = () => {
  return (
    <StyledHeader>
      <StyledHeading href="/" aria-label="20Twenty Score — go to home">20Twenty Score</StyledHeading>
      <Nav />
    </StyledHeader>
  );
};

const StyledHeader = styled.header`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #333;
  padding: 0 1rem;

  @media (max-width: 768px) {
    position: relative;
  }
`;

const StyledHeading = styled(Link)`
  color: #fff;
  margin: 0;
  padding: 1rem 0.5rem;
  font-size: 2rem;
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  text-decoration: underline;
  letter-spacing: 1px;
`;

export default Header;
