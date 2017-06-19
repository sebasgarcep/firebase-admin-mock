'use strict';

const App = require('../../lib/app');
const Reference = require('../../lib/reference');
const Query = require('../../lib/query');
const { DEFAULT_APP_KEY, defaultConfig } = require('../../lib/constants');

const noop = () => {};

let app;
let ref;
describe('Reference testing suite', () => {
  beforeEach(() => {
    app = new App(noop, defaultConfig, DEFAULT_APP_KEY);
  });

  // constructor
  it('should return a query without error when passed a valid app', () => {
    expect(() => new Reference(app)).not.toThrow();
  });

  it('should return a query without error when passed a valid app and location', () => {
    expect(() => new Reference(app, 'foo')).not.toThrow();
  });

  it('should return a different query object every time it is called', () => {
    ref = new Reference(app);
    const query2 = new Reference(app);
    expect(ref).not.toBe(query2);
  });

  // inherits from Query
  it('should return an instance of Query', () => {
    ref = new Reference(app);
    expect(ref).toBeInstanceOf(Query);
  });

  // .key
  it('should have null value for key when the location is the root of the data tree', () => {
    ref = new Reference(app);
    expect(ref.key).toBe(null);
  });

  it('should have key equal the last part of the location in the data tree', () => {
    ref = new Reference(app, 'foo');
    expect(ref.key).toBe('foo');
    ref = new Reference(app, 'foo/bar');
    expect(ref.key).toBe('bar');
  });

  // .parent
  it('should have a null parent when it is the root reference', () => {
    ref = new Reference(app);
    expect(ref.parent).toBe(null);
  });

  it('should have a parent when not the root reference', () => {
    ref = new Reference(app, 'foo');
    expect(ref.parent).toEqual(expect.anything());
  });

  it('should have its parent pointing one level up in the data tree when not the root reference', () => {
    ref = new Reference(app, 'foo');
    expect(ref.parent.key).toBe(null);
  });

  // .root
  it('should have a root reference', () => {
    ref = new Reference(app, 'foo/bar');
    expect(ref.root).toEqual(expect.anything());
  });

  it('should have the root reference point to the root of the data tree', () => {
    ref = new Reference(app, 'foo/bar');
    expect(ref.root.key).toBe(null);
  });

  // .child()
  it('should run without throwing errors when given no arguments to child', () => {
    ref = new Reference(app);
    expect(() => ref.child()).not.toThrow();
  });

  it('should run without throwing errors when given a path to child', () => {
    ref = new Reference(app);
    expect(() => ref.child('foo')).not.toThrow();
  });

  it('should throw when given an invalid path to child', () => {
    ref = new Reference(app);
    expect(() => ref.child('foo.')).toThrow();
  });

  it('should run without throwing errors when given no arguments to child', () => {
    ref = new Reference(app);
    expect(() => ref.child()).not.toThrow();
  });

  it('should return an instance of Reference', () => {
    ref = new Reference(app);
    expect(ref.child()).toBeInstanceOf(Reference);
  });

  it('should return a reference to the same location when given no arguments to child', () => {
    ref = new Reference(app);
    expect(ref.child().key).toBe(null);
  });

  it('should return a reference to childs nested arbitrarily deep when calling child with an argument', () => {
    ref = new Reference(app);
    expect(ref.child('foo').key).toBe('foo');
    expect(ref.child('foo/bar').key).toBe('bar');
  });

  // .onDisconnect() -- missing implementation and tests
  it('should run without errors when calling onDisconnect', () => {
    ref = new Reference(app);
    expect(() => ref.onDisconnect()).not.toThrow();
  });

  // .push()

  // .remove()

  // .set()

  // .setPriority()

  // .setWithPriority()

  // .transaction()

  // .update()
});
