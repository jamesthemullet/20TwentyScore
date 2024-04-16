import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import handleDelete from './[id]';

jest.mock('../../../lib/prisma', () => ({
  post: {
    delete: jest.fn()
  }
}));

describe('DELETE API Handler Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a post and return the deleted post', async () => {
    const req: NextApiRequest = {
      method: 'DELETE',
      query: {
        id: '1'
      }
    } as unknown as NextApiRequest;

    const res: NextApiResponse = {
      json: jest.fn()
    } as unknown as NextApiResponse;

    const mockDeletedPost = { id: 1, title: 'Deleted Post', content: 'Content' };
    (prisma.post.delete as jest.Mock).mockResolvedValueOnce(mockDeletedPost);

    await handleDelete(req, res);

    expect(prisma.post.delete).toHaveBeenCalledWith({
      where: { id: '1' }
    });
    expect(res.json).toHaveBeenCalledWith(mockDeletedPost);
  });

  it('should delete a post and return the deleted post, where id is in an array', async () => {
    const req: NextApiRequest = {
      method: 'DELETE',
      query: {
        id: ['1']
      }
    } as unknown as NextApiRequest;

    const res: NextApiResponse = {
      json: jest.fn()
    } as unknown as NextApiResponse;

    const mockDeletedPost = { id: 1, title: 'Deleted Post', content: 'Content' };
    (prisma.post.delete as jest.Mock).mockResolvedValueOnce(mockDeletedPost);

    await handleDelete(req, res);

    expect(prisma.post.delete).toHaveBeenCalledWith({
      where: { id: '1' }
    });
    expect(res.json).toHaveBeenCalledWith(mockDeletedPost);
  });

  it('should handle unsupported HTTP method', async () => {
    const req: NextApiRequest = {
      method: 'GET',
      query: {
        id: '1'
      }
    } as unknown as NextApiRequest;

    const res: NextApiResponse = {
      json: jest.fn()
    } as unknown as NextApiResponse;

    await expect(handleDelete(req, res)).rejects.toThrowError(
      'The HTTP GET method is not supported at this route.'
    );
  });
});
