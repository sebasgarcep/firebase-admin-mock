'use strict';

const Immutable = require('immutable');
const queryChildren = require('../lib/query-children');

describe('queryChildren testing suite', () => {
  it('should throw when no query configuration is passed', () => {
    expect(() => queryChildren(null)).toThrow();
    expect(() => queryChildren(true)).toThrow();
    expect(() => queryChildren('str')).toThrow();
    expect(() => queryChildren(42)).toThrow();
    expect(() => queryChildren(Immutable.fromJS({ value: 'fake' }))).toThrow();
  });

  it('should run without errors when given a null value, a scalar or an ImmutableJS object and a configuration', () => {
    const config = { order: { by: 'key' } };
    expect(() => queryChildren(null, config)).not.toThrow();
    expect(() => queryChildren(true, config)).not.toThrow();
    expect(() => queryChildren('str', config)).not.toThrow();
    expect(() => queryChildren(42, config)).not.toThrow();
    expect(() => queryChildren(Immutable.fromJS({ value: 'fake' }), config)).not.toThrow();
  });

  it('should return an empty array for scalar and null values', () => {
    const config = { order: { by: 'key' } };
    expect(queryChildren(null, config)).toEqual([]);
    expect(queryChildren(true, config)).toEqual([]);
    expect(queryChildren('str', config)).toEqual([]);
    expect(queryChildren(42, config)).toEqual([]);
  });

  it('should sort correctly by key', () => {
    const config = { order: { by: 'key' } };
    const tree1 = Immutable.fromJS({ key: 'value' });
    expect(queryChildren(tree1, config)).toEqual(['key']);
    const tree2 = Immutable.fromJS({ '100a': 'string', 200: 'number' });
    expect(queryChildren(tree2, config)).toEqual(['200', '100a']);
    const tree3 = Immutable.fromJS({ key: 'value', Foo: 'bar' });
    expect(queryChildren(tree3, config)).toEqual(['Foo', 'key']);
    const tree4 = Immutable.fromJS({ 100: 'value', 200: 'bar' });
    expect(queryChildren(tree4, config)).toEqual(['100', '200']);
  });

  it('should filter correctly by key', () => {
    const tree = Immutable.fromJS({ 100: 'next', and: 'value', foo: 'value', fooBar: 'value', or: 'value' });
    const configNoFilter = { order: { by: 'key' } };
    expect(queryChildren(tree, configNoFilter)).toEqual(expect.arrayContaining(['100', 'and', 'foo', 'fooBar', 'or']));
    const configMin = { order: { by: 'key' }, filter: { min: 'foo', max: undefined } };
    expect(queryChildren(tree, configMin)).not.toEqual(expect.arrayContaining(['100', 'and']));
    const configMax = { order: { by: 'key' }, filter: { min: undefined, max: 'foo\uf8ff' } };
    expect(queryChildren(tree, configMax)).not.toEqual(expect.arrayContaining(['or']));
    const configBoth = { order: { by: 'key' }, filter: { min: 'foo', max: 'foo\uf8ff' } };
    expect(queryChildren(tree, configBoth)).not.toEqual(expect.arrayContaining(['100', 'and', 'or']));
    const configMinNumeric = { order: { by: 'key' }, filter: { min: 200, max: undefined } };
    expect(queryChildren(tree, configMinNumeric)).not.toEqual(expect.arrayContaining(['100']));
    const configMaxNumeric = { order: { by: 'key' }, filter: { min: undefined, max: 200 } };
    expect(queryChildren(tree, configMaxNumeric)).not.toEqual(expect.arrayContaining(['and', 'foo', 'fooBar', 'or']));
    const configBothNumeric = { order: { by: 'key' }, filter: { min: 150, max: 300 } };
    expect(queryChildren(tree, configBothNumeric)).toEqual([]);
  });

  it('should sort correctly by child', () => {
    const config = { order: { by: 'child', path: 'value' } };
    const tree1 = Immutable.fromJS({
      a: { foo: 'bar', value: { nested: 'tree' } },
      b: { value: 100 },
      c: { value: true },
      d: { value: 'value' },
      e: { value: false },
      f: { foo: 'bar' },
    });
    expect(queryChildren(tree1, config)).toEqual(['f', 'e', 'c', 'b', 'd', 'a']);
    const tree2 = Immutable.fromJS({
      b: { foo: 'bar' },
      a: { nested: 'tree' },
    });
    expect(queryChildren(tree2, config)).toEqual(['a', 'b']);
    const tree3 = Immutable.fromJS({
      b: { foo: 'bar', value: false },
      a: { nested: 'tree', value: false },
    });
    expect(queryChildren(tree3, config)).toEqual(['a', 'b']);
    const tree4 = Immutable.fromJS({
      b: { foo: 'bar', value: true },
      a: { nested: 'tree', value: true },
    });
    expect(queryChildren(tree4, config)).toEqual(['a', 'b']);
    const tree5 = Immutable.fromJS({
      c: { foo: 'bar', value: 100 },
      b: { nested: 'tree', value: 200 },
      a: { graph: 'node', value: 100 },
    });
    expect(queryChildren(tree5, config)).toEqual(['a', 'c', 'b']);
    const tree6 = Immutable.fromJS({
      c: { foo: 'bar', value: 'bar' },
      b: { neste: 'tree', value: 'foo' },
      a: { graph: 'node', value: 'bar' },
    });
    expect(queryChildren(tree6, config)).toEqual(['a', 'c', 'b']);
    const tree7 = Immutable.fromJS({
      b: { foo: 'bar', value: { graph: 'node' } },
      a: { nested: 'tree', value: { zebra: 'whale' } },
    });
    expect(queryChildren(tree7, config)).toEqual(['a', 'b']);
  });

  it('should filter correctly by child', () => {
    const tree = Immutable.fromJS({
      a: { foo: { sec: { value: 'bar' } } },
      b: { foo: { sec: 100 } },
      c: { foo: { sec: true } },
      d: { foo: { sec: 'value' } },
      e: { foo: { sec: false } },
      f: { car: 'ferrari' },
      g: { foo: { sec: 'merry' } },
      h: { foo: { sec: 200 } },
    });
    const configNoFilter = { order: { by: 'child', path: 'foo/sec' } };
    expect(queryChildren(tree, configNoFilter)).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']));
    const configMinNull = { order: { by: 'child', path: 'foo/sec' }, filter: { min: null, max: undefined } };
    expect(queryChildren(tree, configMinNull)).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']));
    const configMaxNull = { order: { by: 'child', path: 'foo/sec' }, filter: { min: undefined, max: null } };
    expect(queryChildren(tree, configMaxNull)).toEqual(['f']);
    const configBothNull = { order: { by: 'child', path: 'foo/sec' }, filter: { min: null, max: null } };
    expect(queryChildren(tree, configBothNull)).toEqual(['f']);
    const configMinFalse = { order: { by: 'child', path: 'foo/sec' }, filter: { min: false, max: undefined } };
    expect(queryChildren(tree, configMinFalse)).not.toEqual(expect.arrayContaining(['f']));
    const configMaxFalse = { order: { by: 'child', path: 'foo/sec' }, filter: { min: undefined, max: false } };
    expect(queryChildren(tree, configMaxFalse)).not.toEqual(expect.arrayContaining(['a', 'b', 'c', 'd', 'g', 'h']));
    const configBothFalse = { order: { by: 'child', path: 'foo/sec' }, filter: { min: false, max: false } };
    expect(queryChildren(tree, configBothFalse)).toEqual(['e']);
    const configMinTrue = { order: { by: 'child', path: 'foo/sec' }, filter: { min: true, max: undefined } };
    expect(queryChildren(tree, configMinTrue)).not.toEqual(expect.arrayContaining(['e', 'f']));
    const configMaxTrue = { order: { by: 'child', path: 'foo/sec' }, filter: { min: undefined, max: true } };
    expect(queryChildren(tree, configMaxTrue)).not.toEqual(expect.arrayContaining(['a', 'b', 'd', 'g', 'h']));
    const configBothTrue = { order: { by: 'child', path: 'foo/sec' }, filter: { min: true, max: true } };
    expect(queryChildren(tree, configBothTrue)).toEqual(['c']);
    const configMinNumeric = { order: { by: 'child', path: 'foo/sec' }, filter: { min: 150, max: undefined } };
    expect(queryChildren(tree, configMinNumeric)).not.toEqual(expect.arrayContaining(['b', 'c', 'e', 'f']));
    const configMaxNumeric = { order: { by: 'child', path: 'foo/sec' }, filter: { min: undefined, max: 150 } };
    expect(queryChildren(tree, configMaxNumeric)).not.toEqual(expect.arrayContaining(['a', 'd', 'g', 'h']));
    const configBothNumeric = { order: { by: 'child', path: 'foo/sec' }, filter: { min: 100, max: 200 } };
    expect(queryChildren(tree, configBothNumeric)).not.toEqual(expect.arrayContaining(['a', 'c', 'd', 'e', 'f', 'g']));
    const configMinString = { order: { by: 'child', path: 'foo/sec' }, filter: { min: 'try', max: undefined } };
    expect(queryChildren(tree, configMinString)).not.toEqual(expect.arrayContaining(['b', 'c', 'e', 'f', 'g', 'h']));
    const configMaxString = { order: { by: 'child', path: 'foo/sec' }, filter: { min: undefined, max: 'try' } };
    expect(queryChildren(tree, configMaxString)).not.toEqual(expect.arrayContaining(['a', 'd']));
    const configBothString = { order: { by: 'child', path: 'foo/sec' }, filter: { min: 'merry', max: 'value' } };
    expect(queryChildren(tree, configBothString)).not.toEqual(expect.arrayContaining(['a', 'b', 'c', 'e', 'f', 'h']));
  });

  it('should sort correctly by value', () => {
    const config = { order: { by: 'value' } };
    const tree1 = Immutable.fromJS({
      a: { foo: 'bar' },
      b: 100,
      c: true,
      d: 'value',
      e: false,
      f: null,
    });
    expect(queryChildren(tree1, config)).toEqual(['f', 'e', 'c', 'b', 'd', 'a']);
    const tree2 = Immutable.fromJS({
      b: null,
      a: null,
    });
    expect(queryChildren(tree2, config)).toEqual(['a', 'b']);
    const tree3 = Immutable.fromJS({
      b: false,
      a: false,
    });
    expect(queryChildren(tree3, config)).toEqual(['a', 'b']);
    const tree4 = Immutable.fromJS({
      b: true,
      a: true,
    });
    expect(queryChildren(tree4, config)).toEqual(['a', 'b']);
    const tree5 = Immutable.fromJS({
      c: 100,
      b: 200,
      a: 100,
    });
    expect(queryChildren(tree5, config)).toEqual(['a', 'c', 'b']);
    const tree6 = Immutable.fromJS({
      c: 'bar',
      b: 'foo',
      a: 'bar',
    });
    expect(queryChildren(tree6, config)).toEqual(['a', 'c', 'b']);
    const tree7 = Immutable.fromJS({
      b: { foo: 'bar' },
      a: { foo: 'bar' },
    });
    expect(queryChildren(tree7, config)).toEqual(['a', 'b']);
  });

  it('should filter correctly by value', () => {
    const tree = Immutable.fromJS({
      a: { foo: 'bar' },
      b: 100,
      c: true,
      d: 'value',
      e: false,
      f: null,
      g: 'merry',
      h: 200,
    });
    const configNoFilter = { order: { by: 'value' } };
    expect(queryChildren(tree, configNoFilter)).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']));
    const configMinNull = { order: { by: 'value' }, filter: { min: null, max: undefined } };
    expect(queryChildren(tree, configMinNull)).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']));
    const configMaxNull = { order: { by: 'value' }, filter: { min: undefined, max: null } };
    expect(queryChildren(tree, configMaxNull)).toEqual(['f']);
    const configBothNull = { order: { by: 'value' }, filter: { min: null, max: null } };
    expect(queryChildren(tree, configBothNull)).toEqual(['f']);
    const configMinFalse = { order: { by: 'value' }, filter: { min: false, max: undefined } };
    expect(queryChildren(tree, configMinFalse)).not.toEqual(expect.arrayContaining(['f']));
    const configMaxFalse = { order: { by: 'value' }, filter: { min: undefined, max: false } };
    expect(queryChildren(tree, configMaxFalse)).not.toEqual(expect.arrayContaining(['a', 'b', 'c', 'd', 'g', 'h']));
    const configBothFalse = { order: { by: 'value' }, filter: { min: false, max: false } };
    expect(queryChildren(tree, configBothFalse)).toEqual(['e']);
    const configMinTrue = { order: { by: 'value' }, filter: { min: true, max: undefined } };
    expect(queryChildren(tree, configMinTrue)).not.toEqual(expect.arrayContaining(['e', 'f']));
    const configMaxTrue = { order: { by: 'value' }, filter: { min: undefined, max: true } };
    expect(queryChildren(tree, configMaxTrue)).not.toEqual(expect.arrayContaining(['a', 'b', 'd', 'g', 'h']));
    const configBothTrue = { order: { by: 'value' }, filter: { min: true, max: true } };
    expect(queryChildren(tree, configBothTrue)).toEqual(['c']);
    const configMinNumeric = { order: { by: 'value' }, filter: { min: 150, max: undefined } };
    expect(queryChildren(tree, configMinNumeric)).not.toEqual(expect.arrayContaining(['b', 'c', 'e', 'f']));
    const configMaxNumeric = { order: { by: 'value' }, filter: { min: undefined, max: 150 } };
    expect(queryChildren(tree, configMaxNumeric)).not.toEqual(expect.arrayContaining(['a', 'd', 'g', 'h']));
    const configBothNumeric = { order: { by: 'value' }, filter: { min: 100, max: 200 } };
    expect(queryChildren(tree, configBothNumeric)).not.toEqual(expect.arrayContaining(['a', 'c', 'd', 'e', 'f', 'g']));
    const configMinString = { order: { by: 'value' }, filter: { min: 'try', max: undefined } };
    expect(queryChildren(tree, configMinString)).not.toEqual(expect.arrayContaining(['b', 'c', 'e', 'f', 'g', 'h']));
    const configMaxString = { order: { by: 'value' }, filter: { min: undefined, max: 'try' } };
    expect(queryChildren(tree, configMaxString)).not.toEqual(expect.arrayContaining(['a', 'd']));
    const configBothString = { order: { by: 'value' }, filter: { min: 'merry', max: 'value' } };
    expect(queryChildren(tree, configBothString)).not.toEqual(expect.arrayContaining(['a', 'b', 'c', 'e', 'f', 'h']));
  });

  it('should correctly limit query sizes', () => {
    const tree = Immutable.fromJS({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7 });
    const configFirst = { order: { by: 'key' }, limit: { by: 'first', amount: 3 } };
    expect(queryChildren(tree, configFirst)).toEqual(['a', 'b', 'c']);
    const configLast = { order: { by: 'key' }, limit: { by: 'last', amount: 3 } };
    expect(queryChildren(tree, configLast)).toEqual(['e', 'f', 'g']);
  });
});
