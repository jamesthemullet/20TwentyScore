import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import handler from '.';

jest.mock('../../../lib/prisma', () => ({
  post: {
    create: jest.fn()
  }
}));

describe('API Handler Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a post and return the result', async () => {
    const req: NextApiRequest = {
      body: {
        title: 'Test Title',
        content: 'Test Content',
        session: {
          user: {
            email: 'test@example.com'
          }
        }
      }
    } as NextApiRequest;

    const res: NextApiResponse = {
      json: jest.fn()
    } as unknown as NextApiResponse;

    const mockResult = { id: 1, title: 'Test Title', content: 'Test Content' };
    (prisma.post.create as jest.Mock).mockResolvedValueOnce(mockResult);

    await handler(req, res);

    expect(prisma.post.create).toHaveBeenCalledWith({
      data: {
        title: 'Test Title',
        content: 'Test Content',
        author: { connect: { email: 'test@example.com' } }
      }
    });
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });
});
