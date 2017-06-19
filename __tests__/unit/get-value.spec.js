'use strict';

const Immutable = require('immutable');
const immutableMatchers = require('jest-immutable-matchers');

const getValue = require('../../lib/get-value');

const parseData = Immutable.fromJS;

describe('getValue testing suite', () => {
  beforeEach(() => {
    jest.addMatchers(immutableMatchers);
  });

  it('should return null when the root is null', () => {
    expect(getValue(parseData(null), 'fake', 'key')).toEqualImmutable(null);
  });

  it('should return root when passed no keys', () => {
    const data = parseData({ fake: 'prop' });
    expect(getValue(data)).toEqualImmutable(data);
  });

  it('should return nested values if they exist', () => {
    const data = parseData({ fake: 'prop', nested: { values: { should: 'get' } } });
    expect(getValue(data, 'fake')).toEqualImmutable(data.get('fake'));
    expect(getValue(data, 'nested', 'values'))
      .toEqualImmutable(data.getIn(['nested', 'values']));
    expect(getValue(data, 'nested', 'values', 'should'))
      .toEqualImmutable(data.getIn(['nested', 'values', 'should']));
  });

  it('should return null for values that do not exist', () => {
    const data = parseData({ fake: 'prop' });
    expect(getValue(data, 'real')).toEqualImmutable(null);
  });

  it('should return null for values that are nested too deep', () => {
    const data = parseData({ fake: 'prop' });
    expect(getValue(data, 'fake', 'prop', 'sword')).toEqualImmutable(null);
  });
});
