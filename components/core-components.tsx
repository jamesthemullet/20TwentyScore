import styled from '@emotion/styled';

export const SquareButton = styled.button`
  background-color: #fff;
  border: 1px solid #000;
  border-radius: 0;
  color: #000;
  cursor: pointer;
  display: inline-block;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
  padding: 0.5rem 1rem;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  white-space: nowrap;
  width: 100px;
  aspect-ratio: 1;
  &:hover {
    background-color: #000;
    color: #fff;
  }
  &:focus {
    outline: 0;
  }
`;
