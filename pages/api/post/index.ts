import { NextApiRequest, NextApiResponse } from 'next';
// import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

// POST /api/post
// Required fields in body: title
// Optional fields in body: content
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { title, content, session } = req.body;

  const result = await prisma.post.create({
    data: {
      title: title,
      content: content,
      author: { connect: { email: session?.user?.email } }
    }
  });
  res.json(result);
}
