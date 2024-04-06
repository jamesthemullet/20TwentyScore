// Header.tsx
import React from 'react';
import Nav from '../nav/nav';
import styled from '@emotion/styled';

const Header: React.FC = () => {
  return (
    <>
      <header>
        <Nav />
        <StyledHeading>20Twenty Score</StyledHeading>
      </header>
    </>
  );
};

const StyledHeading = styled.h1`
  color: green;
  text-align: center;
  margin: 0;
  padding: 1rem;
  font-size: 2rem;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ccc;
  font-family: 'Oswald', sans-serif;
`;

export default Header;
