import type { Prisma, GameSave } from '@prisma/client';

export const saveListItemSelect = {
  id: true,
  title: true,
  createdAt: true,
  completed: true,
  seasonId: true,
} satisfies Prisma.GameSaveSelect;

export type SaveListItem = Pick<GameSave, 'id' | 'title' | 'createdAt' | 'completed' | 'seasonId'>;
