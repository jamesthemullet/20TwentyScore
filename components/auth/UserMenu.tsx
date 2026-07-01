import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styled from '@emotion/styled';

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (status === 'loading') return null;

  if (!session) {
    return <SignInLink href="/auth/signin">Sign In</SignInLink>;
  }

  const initials = session.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <Wrapper ref={ref}>
      <Avatar onClick={() => setIsOpen(!isOpen)} aria-label="User menu" aria-expanded={isOpen}>
        {session.user?.image ? (
          <Image src={session.user.image} alt={session.user.name ?? ''} width={32} height={32} style={{ objectFit: 'cover' }} />
        ) : (
          initials
        )}
      </Avatar>
      {isOpen && (
        <Dropdown>
          <DropdownLink href="/dashboard" onClick={() => setIsOpen(false)}>
            Dashboard
          </DropdownLink>
          <DropdownLink href="/account" onClick={() => setIsOpen(false)}>
            Account
          </DropdownLink>
          <DropdownButton onClick={() => signOut({ callbackUrl: '/' })}>Sign out</DropdownButton>
        </Dropdown>
      )}
    </Wrapper>
  );
}

const SignInLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  font-size: 1rem;
  text-transform: uppercase;
  padding: 0.4rem 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  display: inline-block;
  font-family: 'Inter', sans-serif;
  letter-spacing: 2px;
  margin-left: 0.75rem;
  transition: background-color 0.2s, border-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
    border-color: #fff;
  }
`;

const Wrapper = styled.div`
  position: relative;
  margin-left: 0.75rem;
`;

const Avatar = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #fff;
  color: #333;
  border: 2px solid rgba(255, 255, 255, 0.4);
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
  transition: border-color 0.2s;

  &:hover {
    border-color: #fff;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 200;
`;

const dropdownItemStyles = `
  display: block;
  padding: 0.65rem 1rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #333;
  text-decoration: none;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.15s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const DropdownLink = styled(Link)`
  ${dropdownItemStyles}
`;

const DropdownButton = styled.button`
  ${dropdownItemStyles}
`;
