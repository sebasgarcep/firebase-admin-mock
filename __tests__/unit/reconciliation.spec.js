'use strict';

const Immutable = require('immutable');
const reconciliation = require('../../lib/reconciliation');

const parseData = Immutable.fromJS;

describe('reconciliation testing suite', () => {
  it('should run without errors when provided two ImmutableJS maps or null values', () => {
    expect(() => reconciliation(null, null)).not.toThrow();
    expect(() => reconciliation(parseData({ foo: 'bar' }), null)).not.toThrow();
    expect(() => reconciliation(null, parseData({ foo: 'bar' }))).not.toThrow();
    expect(() => reconciliation(parseData({ foo: 'bar' }), parseData({ foo: 'bar' }))).not.toThrow();
  });

  it('should return no updates for equal trees of arbitrary depth', () => {
    const treeDepth1 = { value: 'fake' };
    const treeDepth2 = { value: 'fake', nested: { graph: 'node' } };
    const treeDepth3 = { value: 'fake', nested: { foo: { bar: 'node' } } };
    expect(reconciliation(parseData(treeDepth1), parseData(treeDepth1))).toEqual([]);
    expect(reconciliation(parseData(treeDepth2), parseData(treeDepth2))).toEqual([]);
    expect(reconciliation(parseData(treeDepth3), parseData(treeDepth3))).toEqual([]);
  });

  it('should return the correct list of events when adding arbitrary nodes arbitrarily deep', () => {
    const tree1 = parseData(null);
    const tree2 = parseData({ value: 'fake' });
    const tree3 = parseData({ value: 'fake', foo: 'bar' });
    const tree4 = parseData({ value: 'fake', foo: 'bar', nested: { tree: { graph: 'value' } } });
    const tree5 = parseData({ value: 'fake', foo: 'bar', nested: { tree: { graph: 'value' }, node: 'bird' } });
    expect(reconciliation(tree1, tree2)).toEqual([
      {
        type: 'child_added',
        location: [],
        path: '',
      },
      {
        type: 'child_added',
        location: ['value'],
        path: 'value',
      },
    ]);
    expect(reconciliation(tree2, tree3)).toEqual([
      {
        type: 'child_changed',
        location: [],
        path: '',
      },
      {
        type: 'child_added',
        location: ['foo'],
        path: 'foo',
      },
    ]);
    expect(reconciliation(tree3, tree4)).toEqual([
      {
        type: 'child_changed',
        location: [],
        path: '',
      },
      {
        type: 'child_added',
        location: ['nested'],
        path: 'nested',
      },
      {
        type: 'child_added',
        location: ['nested', 'tree'],
        path: 'nested/tree',
      },
      {
        type: 'child_added',
        location: ['nested', 'tree', 'graph'],
        path: 'nested/tree/graph',
      },
    ]);
    expect(reconciliation(tree4, tree5)).toEqual([
      {
        type: 'child_changed',
        location: [],
        path: '',
      },
      {
        type: 'child_changed',
        location: ['nested'],
        path: 'nested',
      },
      {
        type: 'child_added',
        location: ['nested', 'node'],
        path: 'nested/node',
      },
    ]);
  });

  it('should return the correct list of events when removing arbitrary nodes arbitrarily deep', () => {
    const tree1 = parseData(null);
    const tree2 = parseData({ value: 'fake' });
    const tree3 = parseData({ value: 'fake', foo: 'bar' });
    const tree4 = parseData({ value: 'fake', foo: 'bar', nested: { tree: { graph: 'value' } } });
    const tree5 = parseData({ value: 'fake', foo: 'bar', nested: { tree: { graph: 'value' }, node: 'bird' } });
    expect(reconciliation(tree5, tree4)).toEqual([
      {
        type: 'child_changed',
        location: [],
        path: '',
      },
      {
        type: 'child_changed',
        location: ['nested'],
        path: 'nested',
      },
      {
        type: 'child_removed',
        location: ['nested', 'node'],
        path: 'nested/node',
      },
    ]);
    expect(reconciliation(tree4, tree3)).toEqual([
      {
        type: 'child_changed',
        location: [],
        path: '',
      },
      {
        type: 'child_removed',
        location: ['nested'],
        path: 'nested',
      },
      {
        type: 'child_removed',
        location: ['nested', 'tree'],
        path: 'nested/tree',
      },
      {
        type: 'child_removed',
        location: ['nested', 'tree', 'graph'],
        path: 'nested/tree/graph',
      },
    ]);
    expect(reconciliation(tree3, tree2)).toEqual([
      {
        type: 'child_changed',
        location: [],
        path: '',
      },
      {
        type: 'child_removed',
        location: ['foo'],
        path: 'foo',
      },
    ]);
    expect(reconciliation(tree2, tree1)).toEqual([
      {
        type: 'child_removed',
        location: [],
        path: '',
      },
      {
        type: 'child_removed',
        location: ['value'],
        path: 'value',
      },
    ]);
  });
});
