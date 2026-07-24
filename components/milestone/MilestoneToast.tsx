import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import type React from 'react';
import { MILESTONE_DURATION_MS } from '../../utils/useMilestone';

type Props = {
  message: string;
  accent: string;
};

export const MilestoneToast: React.FC<Props> = ({ message, accent }) => (
  <Toast accent={accent} role="status" aria-live="polite" aria-atomic="true">
    <Message>{message}</Message>
  </Toast>
);

const toastAnim = keyframes`
  0%   { transform: translateY(-100%); opacity: 0; }
  10%  { transform: translateY(0);     opacity: 1; }
  80%  { transform: translateY(0);     opacity: 1; }
  100% { transform: translateY(-20px); opacity: 0; }
`;

const Toast = styled.div<{ accent: string }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #1a1a1a;
  border-bottom: 3px solid ${({ accent }) => accent};
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${toastAnim} ${MILESTONE_DURATION_MS}ms ease forwards;
`;

const Message = styled.p`
  font-family: 'Bodoni Moda', serif;
  font-style: italic;
  font-size: 1.5rem;
  color: #fff;
  margin: 0;
  text-align: center;
`;
