'use strict';

const App = require('../lib/app');

const APP_NAME = 'APP_NAME';
const options = {};

let app;
let deleteApp;
describe('App testing suite', () => {
  beforeEach(() => {
    deleteApp = jest.fn();
    app = new App(deleteApp, options, APP_NAME);
  });

  it('should return an app object', () => {
    expect(app).toEqual(expect.anything());
  });

  it('should set a name property', () => {
    expect(app.name).toEqual(APP_NAME);
  });

  it('should set an options property', () => {
    expect(app.options).toEqual(options);
  });

  it('should return an auth object', () => {
    expect(app.auth()).toEqual(expect.anything());
  });

  it('should always return the same auth object', () => {
    expect(app.auth()).toBe(app.auth());
  });

  it('should return a database object', () => {
    expect(app.database()).toEqual(expect.anything());
  });

  it('should always return the same database object', () => {
    expect(app.database()).toBe(app.database());
  });

  it('should delete itself when calling delete', () => {
    app.delete();
    expect(deleteApp).toHaveBeenCalledTimes(1);
    expect(app.options).toBeUndefined();
    expect(app.name).toBeUndefined();
    expect(() => app.auth()).toThrow();
    expect(() => app.database()).toThrow();
  });

  it('should return a promise on delete', () => {
    const result = app.delete();
    expect(result).toEqual(expect.any(Promise));
  });
});
