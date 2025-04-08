import styled from '@emotion/styled';

export default function Footer() {
  return (
    <FooterContainer>
      <p>20Twenty Score - a website by James Winfield.</p>
      <div>
        Icons made by{' '}
        <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">
          Smashicons
        </a>{' '}
        from{' '}
        <a href="https://www.flaticon.com/" title="Flaticon">
          www.flaticon.com
        </a>
      </div>
    </FooterContainer>
  );
}

const FooterContainer = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #333;
  color: #fff;
  padding: 1rem;
  font-family: 'Oswald', sans-serif;
  position: relative;
  bottom: 0;
  width: 100%;

  a {
    color: #fff;
  }

  p {
    margin: 0;
  }
`;
