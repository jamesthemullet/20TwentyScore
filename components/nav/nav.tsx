import React, { useState } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import { useGameScore } from '../../context/GameScoreContext';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function Nav() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const { gameScore } = useGameScore();

  const saveGame = () => {
    const gameData = JSON.stringify(gameScore);
    localStorage.setItem('gameData', gameData);
    alert('Game saved!');
  };

  const router = useRouter();
  // const isActive: (pathname: string) => boolean = (pathname) => router.pathname === pathname;

  const { data: session, status } = useSession();

  console.log(10, window?.innerWidth);

  return (
    <StyledNav aria-label="Navigation Bar">
      <BurgerButton onClick={toggleDropdown} aria-label="Navigation Menu">
        <span></span>
        <span></span>
        <span></span>
      </BurgerButton>
      <ul className={isDropdownOpen ? 'open' : ''} aria-label="Expanded Menu">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/teams">Teams</Link>
        </li>
        <li>
          <Link href="/scoreboard">Scoreboard</Link>
        </li>
      </ul>
      {!session && <Link href="/api/auth/signin">Log in</Link>}
      {session && (
        <>
          <UserAndLogout>
            ({session?.user?.email})<Link href="/api/auth/signout">Log out</Link>
          </UserAndLogout>
        </>
      )}

      <img
        alt="Save Game"
        width="32px"
        height="32px"
        src="/icons/png/009-save.png"
        onClick={() => saveGame()}
      />
    </StyledNav>
  );
}

const UserAndLogout = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-right: 1rem;
  a {
    margin-left: 0.5rem;
  }
`;

const StyledNav = styled.nav`
  background-color: #333;
  color: #fff;
  padding: 1rem;
  font-family: 'Oswald', sans-serif;
  letter-spacing: 2px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  ul {
    display: flex;
    justify-content: center;
    list-style: none;
    margin: 0;
    padding: 0;
    @media (max-width: 768px) {
      display: none;

      &.open {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    }
  }
  li {
    padding: 0.5rem 2rem;
  }
  a {
    color: #fff;
    text-decoration: none;
    font-size: 1.5rem;
  }
`;

const BurgerButton = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: relative;
    width: 30px;
    height: 22px;
    background-color: transparent;
    border: none;
    padding: 0;
    margin-right: 1rem;
    cursor: pointer;

    span {
      display: block;
      position: absolute;
      width: 100%;
      height: 2px;
      background-color: #fff;
      transition: transform 0.3s, opacity 0.3s;
    }

    span:nth-of-type(1) {
      top: 0;
    }

    span:nth-of-type(2) {
      top: 50%;
      transform: translateY(-50%);
    }

    span:nth-of-type(3) {
      bottom: 0;
    }
  }
`;
