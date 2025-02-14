export type Dictionary<T> = { [type: string]: T }

export function createClass<D, B>(
  constructor: any,
  base: new () => B,
  methods: Dictionary<any>,
) {
  Object.defineProperty(constructor, 'prototype', {
    value: Object.create(
      base.prototype,
      Object.fromEntries(
        Object.entries(methods).map(([key, value]) => [
          key,
          { value, enumerable: false, writable: true, configurable: true },
        ]),
      ),
    ),
    writable: false,
  })
}
