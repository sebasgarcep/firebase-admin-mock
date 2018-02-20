'use strict';

const Immutable = require('immutable');
const reconciliation = require('../../lib/reconciliation');
const { UPDATES } = require('../../lib/constants');

const parseData = Immutable.fromJS;

describe('reconciliation testing suite', () => {
  it('should run without errors when provided two ImmutableJS maps or null values', () => {
    expect(() => reconciliation(null, null)).not.toThrow();
    expect(() => reconciliation(parseData({ foo: 'bar' }), null)).not.toThrow();
    expect(() => reconciliation(null, parseData({ foo: 'bar' }))).not.toThrow();
    expect(() => reconciliation(parseData({ foo: 'bar' }), parseData({ foo: 'bar' }))).not.toThrow();
  });

  it('should return additions for trees of depth 0', () => {
    const treePrev = null;
    const treeNext = 'value2';
    expect(reconciliation(parseData(treePrev), parseData(treeNext))).toEqual({
      [UPDATES]: {
        type: 'added',
        location: [],
        path: '',
        parentLocation: null,
        parentPath: null,
      },
    });
  });

  it('should return changes for trees of depth 0', () => {
    const treePrev = 'value1';
    const treeNext = 'value2';
    expect(reconciliation(parseData(treePrev), parseData(treeNext))).toEqual({
      [UPDATES]: {
        type: 'changed',
        location: [],
        path: '',
        parentLocation: null,
        parentPath: null,
      },
    });
  });

  it('should return removals for trees of depth 0', () => {
    const treePrev = 'value1';
    const treeNext = null;
    expect(reconciliation(parseData(treePrev), parseData(treeNext))).toEqual({
      [UPDATES]: {
        type: 'removed',
        location: [],
        path: '',
        parentLocation: null,
        parentPath: null,
      },
    });
  });

  it('should return no updates for equal trees of arbitrary depth', () => {
    const treeDepth1 = { value: 'fake' };
    const treeDepth2 = { value: 'fake', nested: { graph: 'node' } };
    const treeDepth3 = { value: 'fake', nested: { foo: { bar: 'node' } } };
    expect(reconciliation(parseData(treeDepth1), parseData(treeDepth1))).toEqual(null);
    expect(reconciliation(parseData(treeDepth2), parseData(treeDepth2))).toEqual(null);
    expect(reconciliation(parseData(treeDepth3), parseData(treeDepth3))).toEqual(null);
  });

  it('should return the correct list of events when adding arbitrary nodes arbitrarily deep', () => {
    const tree1 = parseData(null);
    const tree2 = parseData({ value: 'fake' });
    const tree3 = parseData({ value: 'fake', foo: 'bar' });
    const tree4 = parseData({ value: 'fake', foo: 'bar', nested: { tree: { graph: 'value' } } });
    const tree5 = parseData({ value: 'fake', foo: 'bar', nested: { tree: { graph: 'value' }, node: 'bird' } });
    expect(reconciliation(tree1, tree2)).toEqual({
      [UPDATES]: {
        type: 'added',
        location: [],
        path: '',
        parentLocation: null,
        parentPath: null,
      },
      value: {
        [UPDATES]: {
          type: 'added',
          location: ['value'],
          path: 'value',
          parentLocation: [],
          parentPath: '',
        },
      },
    });
    expect(reconciliation(tree2, tree3)).toEqual({
      [UPDATES]: {
        type: 'changed',
        location: [],
        path: '',
        parentLocation: null,
        parentPath: null,
      },
      foo: {
        [UPDATES]: {
          type: 'added',
          location: ['foo'],
          path: 'foo',
          parentLocation: [],
          parentPath: '',
        },
      },
    });
    expect(reconciliation(tree3, tree4)).toEqual({
      [UPDATES]: {
        type: 'changed',
        location: [],
        path: '',
        parentLocation: null,
        parentPath: null,
      },
      nested: {
        [UPDATES]: {
          type: 'added',
          location: ['nested'],
          path: 'nested',
          parentLocation: [],
          parentPath: '',
        },
        tree: {
          [UPDATES]: {
            type: 'added',
            location: ['nested', 'tree'],
            path: 'nested/tree',
            parentLocation: ['nested'],
            parentPath: 'nested',
          },
          graph: {
            [UPDATES]: {
              type: 'added',
              location: ['nested', 'tree', 'graph'],
              path: 'nested/tree/graph',
              parentLocation: ['nested', 'tree'],
              parentPath: 'nested/tree',
            },
          },
        },
      },
    });
    expect(reconciliation(tree4, tree5)).toEqual({
      [UPDATES]: {
        type: 'changed',
        location: [],
        path: '',
        parentLocation: null,
        parentPath: null,
      },
      nested: {
        [UPDATES]: {
          type: 'changed',
          location: ['nested'],
          path: 'nested',
          parentLocation: [],
          parentPath: '',
        },
        node: {
          [UPDATES]: {
            type: 'added',
            location: ['nested', 'node'],
            path: 'nested/node',
            parentLocation: ['nested'],
            parentPath: 'nested',
          },
        },
      },
    });
  });

  it('should return the correct list of events when removing arbitrary nodes arbitrarily deep', () => {
    const tree1 = parseData(null);
    const tree2 = parseData({ value: 'fake' });
    const tree3 = parseData({ value: 'fake', foo: 'bar' });
    const tree4 = parseData({ value: 'fake', foo: 'bar', nested: { tree: { graph: 'value' } } });
    const tree5 = parseData({ value: 'fake', foo: 'bar', nested: { tree: { graph: 'value' }, node: 'bird' } });
    expect(reconciliation(tree5, tree4)).toEqual({
      [UPDATES]: {
        type: 'changed',
        location: [],
        path: '',
        parentLocation: null,
        parentPath: null,
      },
      nested: {
        [UPDATES]: {
          type: 'changed',
          location: ['nested'],
          path: 'nested',
          parentLocation: [],
          parentPath: '',
        },
        node: {
          [UPDATES]: {
            type: 'removed',
            location: ['nested', 'node'],
            path: 'nested/node',
            parentLocation: ['nested'],
            parentPath: 'nested',
          },
        },
      },
    });
    expect(reconciliation(tree4, tree3)).toEqual({
      [UPDATES]: {
        type: 'changed',
        location: [],
        path: '',
        parentLocation: null,
        parentPath: null,
      },
      nested: {
        [UPDATES]: {
          type: 'removed',
          location: ['nested'],
          path: 'nested',
          parentLocation: [],
          parentPath: '',
        },
        tree: {
          [UPDATES]: {
            type: 'removed',
            location: ['nested', 'tree'],
            path: 'nested/tree',
            parentLocation: ['nested'],
            parentPath: 'nested',
          },
          graph: {
            [UPDATES]: {
              type: 'removed',
              location: ['nested', 'tree', 'graph'],
              path: 'nested/tree/graph',
              parentLocation: ['nested', 'tree'],
              parentPath: 'nested/tree',
            },
          },
        },
      },
    });
    expect(reconciliation(tree3, tree2)).toEqual({
      [UPDATES]: {
        type: 'changed',
        location: [],
        path: '',
        parentLocation: null,
        parentPath: null,
      },
      foo: {
        [UPDATES]: {
          type: 'removed',
          location: ['foo'],
          path: 'foo',
          parentLocation: [],
          parentPath: '',
        },
      },
    });
    expect(reconciliation(tree2, tree1)).toEqual({
      [UPDATES]: {
        type: 'removed',
        location: [],
        path: '',
        parentLocation: null,
        parentPath: null,
      },
      value: {
        [UPDATES]: {
          type: 'removed',
          location: ['value'],
          path: 'value',
          parentLocation: [],
          parentPath: '',
        },
      },
    });
  });
});
