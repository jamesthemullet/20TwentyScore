// Header.tsx
import React from 'react';
import Nav from './nav';

const Header: React.FC = () => {
  return (
    <>
      <header>
        <Nav />
        <h1>20Twenty Score</h1>
      </header>
    </>
  );
};

export default Header;
