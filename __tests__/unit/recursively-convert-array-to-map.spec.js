'use strict';

const recursivelyConvertArrayToObject = require('../../lib/recursively-convert-array-to-object');

describe('recursivelyConvertArrayToObject testing suite', () => {
  it('should throw on undefined values', () => {
    expect(() => recursivelyConvertArrayToObject()).toThrow();
  });

  it('should return null, scalar values and objects structurally unchanged', () => {
    expect(recursivelyConvertArrayToObject(null)).toEqual(null);
    expect(recursivelyConvertArrayToObject('str')).toEqual('str');
    expect(recursivelyConvertArrayToObject(true)).toEqual(true);
    expect(recursivelyConvertArrayToObject(100)).toEqual(100);
    expect(recursivelyConvertArrayToObject({ foo: null })).toEqual({ foo: null });
    expect(recursivelyConvertArrayToObject({ foo: 'str' })).toEqual({ foo: 'str' });
    expect(recursivelyConvertArrayToObject({ foo: true })).toEqual({ foo: true });
    expect(recursivelyConvertArrayToObject({ foo: 100 })).toEqual({ foo: 100 });
  });

  it('should convert arrays at any levels into objects', () => {
    expect(recursivelyConvertArrayToObject(['a', 'b', 'c'])).toEqual({ 0: 'a', 1: 'b', 2: 'c' });
    expect(recursivelyConvertArrayToObject({ foo: ['a', 'b', 'c'] }))
      .toEqual({ foo: { 0: 'a', 1: 'b', 2: 'c' } });
  });
});
