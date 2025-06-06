import React, { useState } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
// import { useGameScore } from '../../context/GameScoreContext';
// import { useRouter } from 'next/router';
// import { useSession } from 'next-auth/react';
// import { PrimaryButton } from '../core/buttons';
// import defaultPlayers from '../core/players';

export default function Nav() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // const [isGameLoaded, setGameLoaded] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // const { gameScore, setGameScore } = useGameScore();

  // const loadGame = () => {
  //   const gameData = localStorage.getItem('gameData');
  //   if (gameData) {
  //     const parsedGameData = JSON.parse(gameData);
  //     setGameScore(parsedGameData);
  //     setGameLoaded(true);
  //   }
  // };

  // const saveGame = () => {
  //   const gameData = JSON.stringify(gameScore);
  //   localStorage.setItem('gameData', gameData);
  // };

  // const newGame = () => {
  //   localStorage.removeItem('gameData');
  //   setGameScore([
  //     {
  //       players: defaultPlayers(),
  //       name: 'Team 1',
  //       index: 0,
  //       totalRuns: 0,
  //       totalWicketsConceded: 0,
  //       totalWicketsTaken: 0,
  //       overs: 0,
  //       currentBattingTeam: true,
  //       currentBowlingTeam: false,
  //       finishedBatting: false
  //     },
  //     {
  //       players: defaultPlayers(),
  //       name: 'Team 2',
  //       index: 1,
  //       totalRuns: 0,
  //       totalWicketsConceded: 0,
  //       totalWicketsTaken: 0,
  //       overs: 0,
  //       currentBattingTeam: false,
  //       currentBowlingTeam: true,
  //       finishedBatting: false
  //     }
  //   ]);
  // };

  // const router = useRouter();
  // const isActive: (pathname: string) => boolean = (pathname) => router.pathname === pathname;

  // const { data: session } = useSession();

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
      {/* {!session && (
        <Link href="/api/auth/signin">
          <PrimaryButton>Log in</PrimaryButton>
        </Link>
      )}
      {session && !isGameLoaded && (
        <>
          <UserAndLogout>
            <p>({session?.user?.email})</p>
            <Link href="/api/auth/signout">
              <PrimaryButton>Log out</PrimaryButton>
            </Link>
            <PrimaryButton onClick={() => loadGame()}>Load Game</PrimaryButton>
          </UserAndLogout>
        </>
      )}
      <PrimaryButton onClick={() => newGame()}>New Game</PrimaryButton>
      {session && (
        <SaveButton
          alt="Save Game"
          width="32px"
          height="32px"
          src="/icons/png/009-save.png"
          onClick={() => saveGame()}
        />
      )} */}
    </StyledNav>
  );
}

// const SaveButton = styled.img`
//   cursor: pointer;
// `;

// const UserAndLogout = styled.div`
//   display: flex;
//   flex-direction: row;
//   align-items: center;
//   margin: 1rem 0;
//   justify-content: space-between;

//   button {
//     margin-left: 1rem;
//   }

//   p {
//     display: none;

//     @media (min-width: 769px) {
//       display: block;
//     }
//   }
// `;

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
    a {
      color: #fff;
      text-decoration: none;
      font-size: 1.5rem;
    }
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
      transition:
        transform 0.3s,
        opacity 0.3s;
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
