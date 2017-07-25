'use strict';

const App = require('../../lib/app');
const DataSnapshot = require('../../lib/data-snapshot');
const ThenableReference = require('../../lib/thenable-reference');
const Reference = require('../../lib/reference');
const Query = require('../../lib/query');
const { DEFAULT_APP_KEY, defaultConfig } = require('../../lib/constants');

const noop = () => {};

let app;
let thenref;
describe('ThenableReference testing suite', () => {
  beforeEach(() => {
    app = new App(noop, defaultConfig, DEFAULT_APP_KEY);
    // TODO: Update databse so that this does not cause errors.
    app.database().setMockData({ foo: 'bar' });
  });

  // constructor
  it('should return a query without error when passed a valid app', () => {
    expect(() => new ThenableReference(app)).not.toThrow();
  });

  it('should return a query without error when passed a valid app and location', () => {
    expect(() => new ThenableReference(app, 'foo')).not.toThrow();
  });

  it('should return a different query object every time it is called', () => {
    thenref = new ThenableReference(app);
    const query2 = new ThenableReference(app);
    expect(thenref).not.toBe(query2);
  });

  // inherits from Reference
  it('should return an instance of Reference', () => {
    thenref = new ThenableReference(app);
    expect(thenref).toBeInstanceOf(Reference);
  });

  // inherits from Query
  it('should return an instance of Query', () => {
    thenref = new ThenableReference(app);
    expect(thenref).toBeInstanceOf(Query);
  });

  // .ref
  it('should have a ref propery that is a direct instance of Reference', () => {
    thenref = new ThenableReference(app);
    expect(thenref.ref).toBeInstanceOf(Reference);
    expect(thenref.ref).not.toBeInstanceOf(ThenableReference);
  });

  // .then
  it('should chain .then calls', () => {
    expect(() => {
      thenref
        .then(() => {});

      thenref
        .then(() => true)
        .then(() => {});
    }).not.toThrow();
  });

  it('should return a DataSnapshot when then is called', (done) => {
    thenref
      .then((dataSnapshot) => {
        expect(dataSnapshot).toBeInstanceOf(DataSnapshot);
        done();
      });
  });

  // .catch
  it('should have a catch function', () => {
    expect(thenref.catch).toBeInstanceOf(Function);
  });
});
