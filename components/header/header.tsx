import React from 'react';
import Nav from '../nav/nav';
import styled from '@emotion/styled';

const Header: React.FC = () => {
  return (
    <StyledHeader>
      <StyledHeading>20Twenty Score</StyledHeading>
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

const StyledHeading = styled.p`
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
