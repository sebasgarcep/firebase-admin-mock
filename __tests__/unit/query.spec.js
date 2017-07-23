'use strict';

const App = require('../../lib/app');
const DataSnapshot = require('../../lib/data-snapshot');
const Query = require('../../lib/query');
const Reference = require('../../lib/reference');
const { DEFAULT_APP_KEY, DEFAULT_DATABASE_URL, defaultConfig } = require('../../lib/constants');

const noop = () => {};

let app;
let query;
let other;
describe('Query testing suite', () => {
  beforeEach(() => {
    app = new App(noop, defaultConfig, DEFAULT_APP_KEY);
  });

  // constructor
  it('should return a query without error when passed a valid app', () => {
    expect(() => new Query(app)).not.toThrow();
  });

  it('should return a query without error when passed a valid app and location', () => {
    expect(() => new Query(app, 'foo')).not.toThrow();
  });

  it('should return a different query object every time it is called', () => {
    query = new Query(app);
    const query2 = new Query(app);
    expect(query).not.toBe(query2);
  });

  // .ref
  it('should have a ref propery that is an instance of Reference', () => {
    query = new Query(app);
    expect(query.ref).toBeInstanceOf(Reference);
  });

  it('should have the ref propery point to the same place as the query', () => {
    query = new Query(app, 'child');
    expect(query.ref.key).toBe('child');
  });

  // .endAt()
  it('should call endAt without throwing', () => {
    query = new Query(app);
    expect(() => query.endAt('foo')).not.toThrow();
  });

  it('should return an instance of Query when calling endAt', () => {
    expect((new Query(app)).endAt('foo')).toBeInstanceOf(Query);
  });

  it('should return a new instance when calling endAt', () => {
    query = new Query(app);
    expect(query.endAt('foo')).not.toBe(query);
  });

  it('should set upper bound when calling endAt', () => {
    query = (new Query(app))
      .endAt('foo');

    // internals
    const config = query._generateConfig();
    expect(config.filter.max).toBe('foo');
  });

  // .equalTo()
  it('should call equalTo without throwing', () => {
    query = new Query(app);
    expect(() => query.equalTo('foo')).not.toThrow();
  });

  it('should return an instance of Query when calling equalTo', () => {
    expect((new Query(app)).equalTo('foo')).toBeInstanceOf(Query);
  });

  it('should return a new instance when calling equalTo', () => {
    query = new Query(app);
    expect(query.equalTo('foo')).not.toBe(query);
  });

  it('should set both bounds when calling equalTo', () => {
    query = (new Query(app))
      .equalTo('foo');

    // internals
    const config = query._generateConfig();
    expect(config.filter.min).toBe('foo');
    expect(config.filter.max).toBe('foo');
  });

  // .isEqual()
  it('should call isEqual without throwing', () => {
    query = new Query(app);
    other = new Query(app);
    expect(() => query.isEqual(other)).not.toThrow();
  });

  it('should consider queries when both queries have the same app', () => {
    query = new Query(app);
    other = new Query(app);
    expect(query.isEqual(other)).toBe(true);
  });

  it('should consider queries different when both queries have different apps', () => {
    const app2 = new App(noop, defaultConfig, 'App2');
    query = new Query(app);
    other = new Query(app2);
    expect(query.isEqual(other)).toBe(false);
  });

  it('should consider queries equal when they point to the same location', () => {
    query = new Query(app, 'foo');
    other = new Query(app, 'foo');
    expect(query.isEqual(other)).toBe(true);
  });

  it('should consider queries different when they point to different locations', () => {
    query = new Query(app, 'foo');
    other = new Query(app, 'bar');
    expect(query.isEqual(other)).toBe(false);
  });

  it('should consider queries equal when they have the same ordering method', () => {
    query = (new Query(app))
      .orderByKey();
    other = (new Query(app))
      .orderByKey();
    expect(query.isEqual(other)).toBe(true);
    query = (new Query(app))
      .orderByValue();
    other = (new Query(app))
      .orderByValue();
    expect(query.isEqual(other)).toBe(true);
    query = (new Query(app))
      .orderByChild('foo');
    other = (new Query(app))
      .orderByChild('foo');
    expect(query.isEqual(other)).toBe(true);
  });

  it('should consider queries different when they have different ordering methods', () => {
    query = (new Query(app))
      .orderByKey();
    other = (new Query(app))
      .orderByValue();
    expect(query.isEqual(other)).toBe(false);
    query = (new Query(app))
      .orderByValue();
    other = (new Query(app))
      .orderByChild('foo');
    expect(query.isEqual(other)).toBe(false);
    query = (new Query(app))
      .orderByChild('foo');
    other = (new Query(app))
      .orderByKey();
    expect(query.isEqual(other)).toBe(false);
    query = (new Query(app))
      .orderByChild('foo');
    other = (new Query(app))
      .orderByChild('bar');
    expect(query.isEqual(other)).toBe(false);
  });

  it('should consider queries equal when they have the same filter', () => {
    query = (new Query(app))
      .startAt('foo');
    other = (new Query(app))
      .startAt('foo');
    expect(query.isEqual(other)).toBe(true);
    query = (new Query(app))
      .endAt('foo');
    other = (new Query(app))
      .endAt('foo');
    expect(query.isEqual(other)).toBe(true);
    query = (new Query(app))
      .equalTo('foo');
    other = (new Query(app))
      .equalTo('foo');
    expect(query.isEqual(other)).toBe(true);
  });

  it('should consider queries different when they have different filters', () => {
    query = (new Query(app));
    other = (new Query(app))
      .startAt('foo');
    expect(query.isEqual(other)).toBe(false);
    query = (new Query(app))
      .startAt('foo');
    other = (new Query(app))
      .endAt('foo');
    expect(query.isEqual(other)).toBe(false);
    query = (new Query(app))
      .equalTo('foo');
    other = (new Query(app))
      .endAt('foo');
    expect(query.isEqual(other)).toBe(false);
    query = (new Query(app))
      .startAt('foo');
    other = (new Query(app))
      .startAt('bar');
    expect(query.isEqual(other)).toBe(false);
    query = (new Query(app))
      .endAt('foo');
    other = (new Query(app))
      .endAt('bar');
    expect(query.isEqual(other)).toBe(false);
    query = (new Query(app))
      .equalTo('foo');
    other = (new Query(app))
      .equalTo('bar');
    expect(query.isEqual(other)).toBe(false);
  });

  it('should consider queries equal when they have the same limits', () => {
    query = (new Query(app))
      .limitToFirst(10);
    other = (new Query(app))
      .limitToFirst(10);
    expect(query.isEqual(other)).toBe(true);
    query = (new Query(app))
      .limitToLast(10);
    other = (new Query(app))
      .limitToLast(10);
    expect(query.isEqual(other)).toBe(true);
  });

  it('should consider queries different when they have the different limits', () => {
    query = (new Query(app));
    other = (new Query(app))
      .limitToFirst(10);
    expect(query.isEqual(other)).toBe(false);
    query = (new Query(app))
      .limitToFirst(10);
    other = (new Query(app))
      .limitToLast(10);
    expect(query.isEqual(other)).toBe(false);
    query = (new Query(app))
      .limitToFirst(10);
    other = (new Query(app))
      .limitToFirst(20);
    expect(query.isEqual(other)).toBe(false);
    query = (new Query(app))
      .limitToLast(10);
    other = (new Query(app))
      .limitToLast(20);
    expect(query.isEqual(other)).toBe(false);
  });

  // .limitToFirst()
  it('should call limitToFirst without throwing', () => {
    query = new Query(app);
    expect(() => query.limitToFirst(10)).not.toThrow();
  });

  it('should return an instance of Query when calling limitToFirst', () => {
    expect((new Query(app)).limitToFirst('foo')).toBeInstanceOf(Query);
  });

  it('should return a new instance when calling limitToFirst', () => {
    query = new Query(app);
    expect(query.limitToFirst(10)).not.toBe(query);
  });

  it('should set limit method and amount when calling limitToFirst', () => {
    query = (new Query(app))
      .limitToFirst(10);

    // internals
    const config = query._generateConfig();
    expect(config.limit.by).toBe('first');
    expect(config.limit.amount).toBe(10);
  });

  // .limitToLast()
  it('should call limitToLast without throwing', () => {
    query = new Query(app);
    expect(() => query.limitToLast(10)).not.toThrow();
  });

  it('should return an instance of Query when calling limitToLast', () => {
    expect((new Query(app)).limitToLast('foo')).toBeInstanceOf(Query);
  });

  it('should return a new instance when calling limitToLast', () => {
    query = new Query(app);
    expect(query.limitToLast(10)).not.toBe(query);
  });

  it('should set limit method and amount when calling limitToLast', () => {
    query = (new Query(app))
      .limitToLast(10);

    // internals
    const config = query._generateConfig();
    expect(config.limit.by).toBe('last');
    expect(config.limit.amount).toBe(10);
  });

  it('should throw when calling both limit-to methods', () => {
    expect(() => (new Query(app)).limitToFirst(10).limitToLast(10)).toThrow();
  });

  // .off() -- missing tests

  // .on() -- missing tests

  // .once()
  it('should run once without failing', () => {
    expect(() => (new Query(app)).once('value')).not.toThrow();
  });

  it('should run once with callback', () => {
    const cb = jest.fn();
    query.once('value', cb);
    expect(cb).toHaveBeenCalled();
  });

  it('should run once with callback and DataSnapshot argument', () => {
    const cb = jest.fn((dataSnapshot) => {
      expect(dataSnapshot).toBeInstanceOf(DataSnapshot);
    });
    query.once('value', cb);
    expect(cb).toHaveBeenCalled();
  });

  it('should run once with callback and DataSnapshot argument pointing to Query\'s path', () => {
    const cb = jest.fn((dataSnapshot) => {
      expect(dataSnapshot.key).toBe(query.ref.key);
    });
    query.once('value', cb);
    expect(cb).toHaveBeenCalled();
  });

  it('should resolve once', () => {
    query = new Query(app);
    expect(query.once('value')).resolves.toEqual(expect.anything());
  });

  it('should resolve once with a DataSnapshot', () => {
    query = new Query(app);
    expect(query.once('value')).resolves.toBeInstanceOf(DataSnapshot);
  });

  it('should resolve once with a DataSnapshot pointing to the Query\'s path', () => {
    query = new Query(app);
    query.once('value')
      .then((dataSnapshot) => {
        expect(dataSnapshot.key).toBe(query.ref.key);
      });
  });

  // .orderByChild()
  it('should not throw when calling orderByChild', () => {
    expect(() => (new Query(app)).orderByChild()).not.toThrow();
  });

  it('should return an instance of Query when calling orderByChild', () => {
    query = new Query(app);
    expect(query.orderByChild('foo')).toBeInstanceOf(Query);
  });

  it('should return a new instance when calling orderByChild', () => {
    query = new Query(app);
    expect(query.orderByChild()).not.toBe(query);
  });

  it('should set the order-by of the query when calling orderByChild', () => {
    query = (new Query(app))
      .orderByChild('foo');

    // internals
    const config = query._generateConfig();
    expect(config.order.by).toBe('child');
  });

  it('should set the order-by of the query when calling orderByChild', () => {
    query = (new Query(app))
      .orderByChild('foo');

    // internals
    const config = query._generateConfig();
    expect(config.order.path).toBe('foo');
  });

  // .orderByKey()
  it('should not throw when calling orderByKey', () => {
    expect(() => (new Query(app)).orderByKey()).not.toThrow();
  });

  it('should return an instance of Query when calling orderByKey', () => {
    query = new Query(app);
    expect(query.orderByKey()).toBeInstanceOf(Query);
  });

  it('should return a new instance when calling orderByKey', () => {
    query = new Query(app);
    expect(query.orderByKey()).not.toBe(query);
  });

  it('should set the order-by of the query when calling orderByKey', () => {
    query = (new Query(app))
      .orderByKey();

    // internals
    const config = query._generateConfig();
    expect(config.order.by).toBe('key');
  });

  // .orderByPriority() -- missing implementation and tests
  it('should not throw when calling orderByPriority', () => {
    expect(() => (new Query(app).orderByPriority())).not.toThrow();
  });

  // .orderByValue()
  it('should not throw when calling orderByValue', () => {
    expect(() => (new Query(app)).orderByValue()).not.toThrow();
  });

  it('should return an instance of Query when calling orderByValue', () => {
    query = new Query(app);
    expect(query.orderByValue()).toBeInstanceOf(Query);
  });

  it('should return a new instance when calling orderByValue', () => {
    query = new Query(app);
    expect(query.orderByValue()).not.toBe(query);
  });

  it('should set the order-by of the query when calling orderByValue', () => {
    query = (new Query(app))
      .orderByValue();

    // internals
    const config = query._generateConfig();
    expect(config.order.by).toBe('value');
  });

  // .startAt()
  it('should call startAt without throwing', () => {
    query = new Query(app);
    expect(() => query.startAt('foo')).not.toThrow();
  });

  it('should return an instance of Query when calling startAt', () => {
    expect((new Query(app)).startAt('foo')).toBeInstanceOf(Query);
  });

  it('should return a new instance when calling startAt', () => {
    query = new Query(app);
    expect(query.startAt('foo')).not.toBe(query);
  });

  it('should set upper bound when calling startAt', () => {
    query = (new Query(app))
      .startAt('foo');

    // internals
    const config = query._generateConfig();
    expect(config.filter.min).toBe('foo');
  });

  // .toJSON() -- missing implementation and tests
  it('should not throw when calling toJSON', () => {
    expect(() => (new Query(app)).toJSON()).not.toThrow();
  });

  // .toString()
  it('should return the absolute URL of the location when calling toString', () => {
    const url = `${DEFAULT_DATABASE_URL}/foo/bar`;
    query = new Query(app, 'foo/bar');
    expect(query.toString()).toEqual(url);
    query = new Query(app, 'foo/bar/');
    expect(query.toString()).toEqual(url);
    query = new Query(app, '/foo/bar');
    expect(query.toString()).toEqual(url);
    query = new Query(app, '/foo/bar/');
    expect(query.toString()).toEqual(url);
  });

  // INTERNALS
  it('should generate a default config when calling _generateConfig with no parameters', () => {
    query = new Query(app);
    const config = query._generateConfig();
    expect(config.order).toEqual(expect.anything());
    expect(config.order.by).toEqual('key');
  });

  it('should return a DataSnapshot when calling _getDataSnapshot', () => {
    query = new Query(app);
    const snapshot = query._getDataSnapshot();
    expect(snapshot).toBeInstanceOf(DataSnapshot);
  });
});
