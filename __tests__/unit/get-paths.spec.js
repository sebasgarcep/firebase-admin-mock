'use strict';

const getPaths = require('../../lib/get-paths');

describe('getPaths testing suite', () => {
  it('should run without errors when provided a valid key', () => {
    expect(getPaths('/')).toEqual(expect.anything());
  });

  it('should error if key contains any of .[]$', () => {
    expect(() => getPaths('.')).toThrow();
    expect(() => getPaths('[')).toThrow();
    expect(() => getPaths(']')).toThrow();
    expect(() => getPaths('$')).toThrow();
  });

  it('should error with multiple slashes together', () => {
    expect(() => getPaths('//')).toThrow();
  });

  it('should accept keys that begin with a slash and keys that don\'t', () => {
    expect(getPaths('/')).toEqual(expect.anything());
    expect(getPaths('')).toEqual(expect.anything());
  });

  it('should return an empty array for root keys and falsy values', () => {
    expect(getPaths('/')).toEqual([]);
    expect(getPaths('')).toEqual([]);
    expect(getPaths()).toEqual([]);
  });

  it('should correctly split a key', () => {
    expect(getPaths('child')).toEqual(['child']);
    expect(getPaths('child/toy')).toEqual(['child', 'toy']);
    expect(getPaths('child/toy/name')).toEqual(['child', 'toy', 'name']);
    expect(getPaths('/child')).toEqual(['child']);
    expect(getPaths('/child/toy')).toEqual(['child', 'toy']);
    expect(getPaths('/child/toy/name')).toEqual(['child', 'toy', 'name']);
  });
});
