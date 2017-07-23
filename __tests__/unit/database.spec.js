'use strict';

const Immutable = require('immutable');
const immutableMatchers = require('jest-immutable-matchers');

const App = require('../../lib/app');
const Database = require('../../lib/database');
const Reference = require('../../lib/reference');
const { defaultConfig, DEFAULT_APP_KEY } = require('../../lib/constants');

let database;
const app = new App(() => { }, defaultConfig, DEFAULT_APP_KEY);
describe('Database testing suite', () => {
  beforeEach(() => {
    jest.addMatchers(immutableMatchers);
    database = new Database(app);
  });

  // constructor
  it('should return a database object when calling the constructor', () => {
    expect(database).toEqual(expect.anything());
  });

  it('should return a new object every time the constructor is called', () => {
    expect(database).not.toBe(new Database());
  });

  // .app
  it('should have an app', () => {
    expect(database.app).toEqual(expect.anything());
  });

  it('should have its app be the same it was passed in the constructor', () => {
    expect(database.app).toBe(app);
  });

  // .goOffline() -- missing implementation and tests
  it('should run goOffline without errors', () => {
    expect(() => database.goOffline()).not.toThrow();
  });

  // .goOnline() -- missing implementation and tests
  it('should run goOnline without errors', () => {
    expect(() => database.goOnline()).not.toThrow();
  });

  // .ref()
  it('should run without errors when calling ref', () => {
    expect(() => database.ref()).not.toThrow();
  });

  it('should return a reference when calling ref', () => {
    expect(database.ref()).toBeInstanceOf(Reference);
  });

  it('should return a reference when calling ref with a path', () => {
    expect(database.ref('child_name')).toBeInstanceOf(Reference);
  });

  // .refFromURL()
  it('should run without errors when calling refFromURL', () => {
    expect(() => database.refFromURL(defaultConfig.databaseUrl)).not.toThrow();
  });

  it('should return a referencee when calling refFromURL', () => {
    expect(database.refFromURL(defaultConfig.databaseUrl)).toBeInstanceOf(Reference);
  });

  it('should throw an error when calling refFromURL with a different base url than the database', () => {
    expect(() => database.refFromURL('https://not-database-url.firebaseio.com')).toThrow();
  });

  // INTERNALS
  it('should initialize online', () => {
    expect(database._online).toBe(true);
  });

  it('should initialize an empty database', () => {
    expect(database._data).toEqualImmutable(Immutable.fromJS({}));
  });

  it('should transform array into maps', () => {
    const value = database._makeImmutable([4, 5, 6]);
    expect(value).toEqualImmutable(Immutable.fromJS({ 0: 4, 1: 5, 2: 6 }));
  });

  it('should transform nested arrays into maps', () => {
    const value = database._makeImmutable({ val: [4, 5, 6] });
    expect(value).toEqualImmutable(Immutable.fromJS({ val: { 0: 4, 1: 5, 2: 6 } }));
  });

  it('should return current data', () => {
    expect(database._getData()).toEqualImmutable(Immutable.fromJS({}));
  });

  // TESTING UTILITIES
  it('should set mock data', () => {
    const data = { data: 'DATA' };
    database.setMockData(data);
    expect(database._getData()).toEqualImmutable(Immutable.fromJS(data));
  });

  it('should purge mock data', () => {
    const data = { data: 'DATA' };
    database.setMockData(data);
    database.purgeMockData(data);
    expect(database._data).toBe(null);
  });

  it('should return the mock data', () => {
    const data = { data: 'DATA' };
    database.setMockData(data);
    expect(database.getMockData()).toEqual(data);
  });
});
