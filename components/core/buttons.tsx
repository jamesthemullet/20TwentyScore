import styled from '@emotion/styled';

export const SquareButton = styled.button`
  background-color: #fff;
  border: 5px solid green;
  border-radius: 0;
  color: #000;
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
  &:hover {
    background-color: green;
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

export const PrimaryButton = styled.button`
  background-color: green;
  border: 1px solid #000;
  border-radius: 0;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-size: 1rem;
  font-family: 'Oswald', sans-serif;
  font-weight: 400;
  line-height: 1.5;
  padding: 0.5rem 1rem;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  vertical-align: middle;

  a {
    color: #fff;
    text-decoration: none;
  }
`;
