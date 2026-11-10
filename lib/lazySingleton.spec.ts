import { lazySingleton } from './lazySingleton';

describe('lazySingleton', () => {
  it('does not call the factory until a property is accessed', () => {
    const getInstance = jest.fn(() => ({ value: 1 }));
    lazySingleton(getInstance);
    expect(getInstance).not.toHaveBeenCalled();
  });

  it('proxies property access through to the instance returned by the factory', () => {
    const getInstance = jest.fn(() => ({ value: 42 }));
    const proxy = lazySingleton(getInstance);
    expect(proxy.value).toBe(42);
    expect(getInstance).toHaveBeenCalled();
  });

  it('calls the factory again on each access, leaving caching to the factory itself', () => {
    const getInstance = jest.fn(() => ({ value: 1 }));
    const proxy = lazySingleton(getInstance);
    proxy.value;
    proxy.value;
    expect(getInstance).toHaveBeenCalledTimes(2);
  });
});
