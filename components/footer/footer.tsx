import styled from '@emotion/styled';

export default function Footer() {
  return (
    <FooterContainer>
      <FooterRule />
      <FooterInner>
        <FooterQuote>
          &ldquo;Cricket is not just a sport &mdash; it is an expression of who we are.&rdquo;
          <FooterAttribution>&mdash; Sir Garfield Sobers</FooterAttribution>
        </FooterQuote>
        <FooterRight>
          <FooterBrand>20Twenty &amp; Score &middot; MMXXVI</FooterBrand>
          <FooterAttribution>
            Icons by{' '}
            <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">
              Smashicons
            </a>{' '}
            via{' '}
            <a href="https://www.flaticon.com/" title="Flaticon">
              Flaticon
            </a>
          </FooterAttribution>
        </FooterRight>
      </FooterInner>
    </FooterContainer>
  );
}

const FooterContainer = styled.footer`
  width: 100%;
  padding: 0 1.5rem 1.5rem;
`;

const FooterRule = styled.hr`
  border: none;
  border-top: 1px solid #1a1a1a;
  margin: 0 0 1rem;
`;

const FooterInner = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const FooterQuote = styled.div`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 0.8rem;
  color: #555;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

const FooterRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
`;

const FooterBrand = styled.span`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 0.75rem;
  color: #767676;
  white-space: nowrap;
`;

const FooterAttribution = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  color: #767676;

  a {
    color: #767676;
    text-decoration: underline;
  }
`;
