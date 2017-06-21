'use strict';

const Immutable = require('immutable');
const immutableMatchers = require('jest-immutable-matchers');

const setValue = require('../../lib/set-value');

const parseData = Immutable.fromJS;

describe('getValue testing suite', () => {
  beforeEach(() => {
    jest.addMatchers(immutableMatchers);
  });

  it('should return the value when there are no keys', () => {
    expect(setValue(parseData(null), true)).toEqualImmutable(true);
  });

  it('should return the value when the keys have length 0', () => {
    expect(setValue(parseData(null), true, [])).toEqualImmutable(true);
  });

  it('should set scalar values at object levels that exist', () => {
    const data = parseData({ fake: 'prop' });
    const result = parseData({ fake: 'prop', foo: true });
    expect(setValue(data, true, ['foo'])).toEqualImmutable(result);
  });

  it('should set scalar values at any object level when root is a scalar', () => {
    const data = parseData(null);
    const result = parseData({ foo: true });
    expect(setValue(data, true, ['foo'])).toEqualImmutable(result);
  });

  it('should set scalar values at any object level that does not exist', () => {
    const data = parseData({ foo: { bar: true } });
    const result = parseData({ foo: { bar: true }, baz: { moon: 'green' } });
    expect(setValue(data, 'green', ['baz', 'moon'])).toEqualImmutable(result);
  });

  it('should set object values at any object level when root is a scalar', () => {
    const data = parseData(null);
    const result = parseData({ foo: true });
    expect(setValue(data, { foo: true }, [])).toEqualImmutable(result);
  });

  it('should overwrite values after the keys\' level', () => {
    const data = parseData({ fake: 'prop' });
    const result = parseData({ foo: true });
    expect(setValue(data, { foo: true }, [])).toEqualImmutable(result);
  });

  it('should recursively delete empty objects', () => {
    const data = parseData({ foo: { bar: 'baz' } });
    const result = parseData(null);
    expect(setValue(data, null, ['foo', 'bar'])).toEqualImmutable(result);
  });
});
