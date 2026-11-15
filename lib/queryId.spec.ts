import type { NextApiRequest } from 'next';
import { getQueryId } from './queryId';

function mockReq(id: unknown): NextApiRequest {
  return { query: { id } } as unknown as NextApiRequest;
}

describe('getQueryId', () => {
  it('returns the id when it is a single string', () => {
    expect(getQueryId(mockReq('s1'))).toBe('s1');
  });

  it('returns the first value when the id is an array', () => {
    expect(getQueryId(mockReq(['s1', 's2']))).toBe('s1');
  });

  it('returns undefined when the id is missing', () => {
    expect(getQueryId(mockReq(undefined))).toBeUndefined();
  });
});
