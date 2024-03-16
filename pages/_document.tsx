import Document, { Html, Head, Main, NextScript } from 'next/document';
import styled from '@emotion/styled';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" data-testid="html">
        <Head />
        <StyledBody>
          <Main />
          <NextScript />
        </StyledBody>
      </Html>
    );
  }
}

export default MyDocument;

const StyledBody = styled.body`
  margin: 0;
  padding: 0;
`;
