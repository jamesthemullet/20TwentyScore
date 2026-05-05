import styled from '@emotion/styled';

const baseButton = `
  border-radius: 999px;
  cursor: pointer;
  display: inline-block;
  font-size: 0.85rem;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  letter-spacing: 0.12em;
  line-height: 1.5;
  padding: 0.6rem 1.5rem;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  vertical-align: middle;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  a {
    text-decoration: none;
  }
`;

export const PrimaryButton = styled.button`
  ${baseButton}
  background-color: #333;
  border: 2px solid #333;
  color: #fff;

  a {
    color: #fff;
  }

  &:hover:not(:disabled) {
    background-color: #555;
    border-color: #555;
  }
`;

export const SecondaryButton = styled.button`
  ${baseButton}
  background-color: #fff;
  border: 2px solid #333;
  color: #333;

  a {
    color: #333;
  }

  &:hover:not(:disabled) {
    background-color: #f0f0f0;
  }
`;

export const SquareButton = styled.button`
  background-color: #fff;
  border: 5px solid #333;
  border-radius: 0;
  color: #333;
  cursor: pointer;
  display: inline-block;
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  padding: 0.5rem;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  white-space: nowrap;
  width: 100px;
  aspect-ratio: 1;
  text-wrap: balance;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #333;
    color: #fff;
  }

  &:focus {
    outline: 0;
  }

  &:disabled {
    background-color: #ccc;
    border-color: #ccc;
    color: #fff;
    cursor: not-allowed;
  }
`;
