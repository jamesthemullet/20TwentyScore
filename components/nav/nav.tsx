import styled from '@emotion/styled';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Nav() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const isActive = (href: string) => router.pathname === href;

  return (
    <StyledNav aria-label="Navigation Bar">
      <BurgerButton onClick={toggleDropdown} aria-label="Navigation Menu">
        <span></span>
        <span></span>
        <span></span>
      </BurgerButton>
      <ul className={isDropdownOpen ? 'open' : ''} aria-label="Expanded Menu">
        <li>
          <Link href="/" className={isActive('/') ? 'active' : ''}>
            Home
          </Link>
        </li>
        <li>
          <Link href="/match" className={isActive('/match') ? 'active' : ''}>
            Match
          </Link>
        </li>
        <li>
          <Link href="/teams" className={isActive('/teams') ? 'active' : ''}>
            Teams
          </Link>
        </li>
        <li>
          <Link href="/summary" className={isActive('/summary') ? 'active' : ''}>
            Summary
          </Link>
        </li>
      </ul>
    </StyledNav>
  );
}

const StyledNav = styled.nav`
  font-family: "Inter", sans-serif;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  padding: 0.75rem 0;

  ul {
    display: flex;
    flex-direction: row;
    gap: 0.75rem;
    list-style: none;
    margin: 0;
    padding: 0;

    @media (max-width: 768px) {
      display: none;

      &.open {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        padding: 0.75rem 0 1rem;
        gap: 0.5rem;
      }
    }
  }

  li a {
    color: #fff;
    text-decoration: none;
    font-size: 1rem;
    text-transform: uppercase;
    padding: 0.4rem 1.25rem;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-radius: 999px;
    display: inline-block;
    transition: background-color 0.2s, border-color 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.15);
      border-color: #fff;
    }

    &.active {
      background-color: #fff;
      border-color: #fff;
      color: #1a1a1a;
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
    margin-left: auto;

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
