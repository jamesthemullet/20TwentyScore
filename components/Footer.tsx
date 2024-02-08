import styled from '@emotion/styled';

export default function Footer() {
  return (
    <FooterContainer>
      <p>This is footer</p>
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

const FooterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid black;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
  min-height: 80px;
`;
