import { signIn } from 'next-auth/react';
import styled from '@emotion/styled';
import { PrimaryButton } from '../../components/core/buttons';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1.5rem;
  font-family: 'Bodoni Moda', serif;
`;

const Title = styled.h1`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 2rem;
  margin: 0 0 0.5rem;
`;

const Subtitle = styled.p`
  font-family: 'Inter', sans-serif;
  color: #555;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 280px;
`;

export default function SignIn() {
  return (
    <Container>
      <Title>20Twenty Score</Title>
      <Subtitle>Sign in to save your games and seasons</Subtitle>
      <ButtonGroup>
        <PrimaryButton onClick={() => signIn('google', { callbackUrl: '/' })}>
          Sign in with Google
        </PrimaryButton>
      </ButtonGroup>
    </Container>
  );
}
