'use strict';

const App = require('../../lib/app');
const ThenableReference = require('../../lib/thenable-reference');
const Reference = require('../../lib/reference');
const Query = require('../../lib/query');
const { DEFAULT_APP_KEY, defaultConfig } = require('../../lib/constants');

const noop = () => {};

let app;
let ref;
describe('Reference testing suite', () => {
  beforeEach(() => {
    app = new App(noop, defaultConfig, DEFAULT_APP_KEY);
    // TODO: Update databse so that this does not cause errors.
    app.database().setMockData({ foo: 'bar' });
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

  // .ref
  it('should have a ref propery that is an instance of Reference', () => {
    ref = new Reference(app);
    expect(ref.ref).toBeInstanceOf(Reference);
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
  it('should run without errors when calling push without a callback', () => {
    ref = new Reference(app);
    expect(() => ref.push('foo')).not.toThrow();
  });

  it('should run without errors when calling push with a callback', () => {
    ref = new Reference(app);
    expect(() => ref.push('foo', () => {})).not.toThrow();
  });

  it('should return a ThenableReference when no value is passed to push', () => {
    ref = new Reference(app);
    expect(ref.push()).toBeInstanceOf(ThenableReference);
  });

  it('should return a ThenableReference when a null value is passed to push', () => {
    ref = new Reference(app);
    expect(ref.push(null)).toBeInstanceOf(ThenableReference);
  });

  it('should return a ThenableReference when a value is passed to push', () => {
    ref = new Reference(app);
    expect(ref.push('foo')).toBeInstanceOf(ThenableReference);
  });

  it('should add a new key to the current reference when pushing a value', (done) => {
    ref = new Reference(app);

    app.database().setMockData(null);

    ref.push('foo')
      .then(() => ref.once('value'))
      .then(snapshot => snapshot.val())
      .then(Object.keys)
      .then(keys => keys.length)
      .then((numKeys) => {
        expect(numKeys).toBe(1);
        done();
      });
  });

  // .remove()
  it('should run without errors when calling remove without a callback', () => {
    ref = new Reference(app);

    return expect(ref.remove()).resolves.toBe(undefined);
  });

  it('should run without errors when calling remove with key that does not exist', (done) => {
    ref = new Reference(app);

    ref.child('undefined_key').remove((res) => {
      expect(res).toBe(undefined);
      done();
    });
  });

  it('should run without errors when calling remove on a child that does not exist', () => {
    ref = new Reference(app);

    return expect(ref.child('undefined_key').remove()).resolves.toBe(undefined);
  });

  // .set();
  it('should throw an erorr when set is called without any arguments', (done) => {
    ref = new Reference(app);

    try {
      ref.set();
    } catch (error) {
      expect(error.message).toBe('Undefined is not allowed in the data tree.');
      done();
    }
  });

  it('should delete value when set is called with null', (done) => {
    ref = new Reference(app);

    ref.set(null)
      .then(() => ref.once('value'))
      .then((snapshot) => {
        expect(snapshot.val()).toBe(null);
        done();
      });
  });

  it('should run without errors when calling set with a callback', (done) => {
    ref = new Reference(app);

    ref.set('foo_bar', (res) => {
      expect(res).toBe(undefined);

      ref.once('value').then((snapshot) => {
        expect(snapshot.val()).toBe('foo_bar');

        done();
      });
    });
  });

  it('should run without errors when calling set without a callback', (done) => {
    ref = new Reference(app);

    ref.set('foo_bar')
      .then(() => ref.once('value'))
      .then((snapshot) => {
        expect(snapshot.val()).toBe('foo_bar');
        done();
      });
  });

  it('should run without errors when calling set on a child key that does not exist', (done) => {
    ref = new Reference(app);

    ref.child('path/to/foo').set('bar')
      .then(() => ref.child('path/to/foo').once('value'))
      .then((snapshot) => {
        expect(snapshot.val()).toBe('bar');
        done();
      });
  });

  it('should run without errors when calling set with complex data', (done) => {
    ref = new Reference(app);

    const data = {
      foo_bar: 'foo_foo_bar_bar',
      bar: {
        bar_foo: 'bar_bar_bar',
      },
    };

    ref.set(data)
      .then(() => ref.once('value'))
      .then((snapshot) => {
        expect(snapshot.val()).toEqual(data);
        done();
      });
  });

  // .setPriority()

  // .setWithPriority()

  // .transaction()

  // .update()
  it('should throw an error when update is called with no arguments', (done) => {
    ref = new Reference(app);

    try {
      ref.update();
    } catch (error) {
      expect(error.message).toBe('Undefined is not allowed in the data tree.');
      done();
    }
  });

  it('should delete value when update is called with null', (done) => {
    ref = new Reference(app);

    ref.update(null)
      .then(() => ref.once('value'))
      .then((snapshot) => {
        expect(snapshot.val()).toBe(null);
        done();
      });
  });

  it('should update the value of the ref when update is called with a new non-object value', (done) => {
    ref = new Reference(app);

    const dataSet = {
      foo: 'bar',
      bar: 'foo',
    };

    ref.set(dataSet)
      .then(() => ref.once('value'))
      .then((snapshot) => {
        expect(snapshot.val()).toEqual(dataSet);
      })
      .then(() => {
        const onComplete = () => {
          ref.child('foo').once('value')
            .then((fooSnapshot) => {
              expect(fooSnapshot.val()).toBe('foo');
              done();
            });
        };

        ref.child('foo').update('foo', onComplete);
      });
  });

  it('should update the value of the ref when update is called with an object value', (done) => {
    ref = new Reference(app);

    const dataSet = {
      foo: 'bar',
      bar: 'foo',
    };

    ref.set(dataSet)
      .then(() => ref.once('value'))
      .then((snapshot) => {
        expect(snapshot.val()).toEqual(dataSet);
      })
      .then(() => {
        const onComplete = () => {
          Promise.all([
            ref.child('foo').once('value').then((fooSnapshot) => {
              expect(fooSnapshot.val()).toBe('foo');
            }),
            ref.child('bar').once('value').then((fooSnapshot) => {
              expect(fooSnapshot.val()).toBe('bar');
            }),
          ]).then(() => done());
        };

        ref.update({ foo: 'foo', bar: 'bar' }, onComplete);
      });
  });
});
