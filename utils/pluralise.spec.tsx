import { pluralise } from './pluralise';

describe('pluralise', () => {
  it('returns singular when count is 1', () => {
    expect(pluralise(1, 'item', 'items')).toBe('item');
  });

  it('returns plural when count is not 1', () => {
    expect(pluralise(0, 'item', 'items')).toBe('items');
    expect(pluralise(2, 'item', 'items')).toBe('items');
  });
});
