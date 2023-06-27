import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

// PUT /api/publish/:id
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const postId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const post = await prisma.post.update({
    where: { id: postId },
    data: { published: true }
  });
  res.json(post);
}
