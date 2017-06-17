'use strict';

const Immutable = require('immutable');
const immutableMatchers = require('jest-immutable-matchers');

const Database = require('../../lib/database');

let database;
describe('Database testing suite', () => {
  beforeEach(() => {
    jest.addMatchers(immutableMatchers);
    database = new Database();
  });

  it('should return a database object when calling the constructor', () => {
    expect(database).toEqual(expect.anything());
  });

  it('should return a new object every time the constructor is called', () => {
    expect(database).not.toBe(new Database());
  });

  it('should return a reference when calling ref', () => {
    expect(database.ref()).toEqual(expect.anything());
  });

  it('should return a reference when calling ref with a path', () => {
    expect(database.ref('child_name')).toEqual(expect.anything());
  });

  // INTERNALS
  it('should initialize online', () => {
    expect(database._online).toBe(true);
  });

  it('should initialize an empty database', () => {
    expect(database._data).toBe(null);
  });

  it('should transform array into maps', () => {
    const value = database._makeImmutable([4, 5, 6]);
    expect(value).toEqual({ 0: 4, 1: 5, 2: 6 });
  });

  it('should transform nested arrays into maps', () => {
    const value = database._makeImmutable({ val: [4, 5, 6] });
    expect(value).toEqual({ val: { 0: 4, 1: 5, 2: 6 } });
  });

  it('should return current data', () => {
    expect(database._getData()).toEqual(null);
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
