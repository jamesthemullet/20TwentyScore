import type { NextApiRequest } from 'next';

export function getQueryId(req: NextApiRequest): string | undefined {
  const { id } = req.query;
  return Array.isArray(id) ? id[0] : id;
}
