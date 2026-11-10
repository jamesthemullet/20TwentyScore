export function lazySingleton<T extends object>(getInstance: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      return Reflect.get(getInstance(), prop, receiver);
    },
  });
}
