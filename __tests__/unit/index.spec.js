'use strict';

const { AdminRoot } = require('../../lib');

let admin;
describe('Firebase admin root testing suite', () => {
  beforeEach(() => {
    admin = new AdminRoot();
    admin.initializeApp({});
  });

  it('should return an admin object', () => {
    admin = new AdminRoot();
    expect(admin).toEqual(expect.anything());
  });

  it('should throw if no app has been initialized', () => {
    admin = new AdminRoot();
    expect(() => { admin.app(); }).toThrow();
  });

  it('should a return a new instance every time AdminRoot is called', () => {
    const admin2 = new AdminRoot();
    expect(admin).not.toBe(admin2);
  });

  it('should throw an error when requesting an uninitialized app', () => {
    expect(() => admin.app('APP_NAME')).toThrow();
  });

  it('should throw an error when initializing already initialized apps', () => {
    expect(() => admin.initializeApp({})).toThrow();
  });

  it('should throw when passing no options to the initialize app method', () => {
    admin = new AdminRoot();
    expect(() => admin.initializeApp()).toThrow();
  });

  it('should return an initialized app on initialization', () => {
    const app = admin.initializeApp({}, 'APP_NAME');
    expect(app).toEqual(expect.anything());
  });

  it('should add app to app array', () => {
    expect(admin.apps).not.toEqual(expect.arrayContaining(['APP_NAME']));
    admin.initializeApp({}, 'APP_NAME');
    expect(admin.apps).toEqual(expect.arrayContaining(['APP_NAME']));
  });

  it('should return the initialized app when requested by name', () => {
    const app = admin.initializeApp({}, 'APP_NAME');
    expect(admin.app('APP_NAME')).toBe(app);
  });

  it('should return a default app', () => {
    expect(admin.app()).toEqual(expect.anything());
  });

  it('should return an app\'s auth object', () => {
    const app = admin.initializeApp({}, 'APP_NAME');
    expect(admin.auth(app)).toBe(app.auth());
  });

  it('should return an app\'s database object', () => {
    const app = admin.initializeApp({}, 'APP_NAME');
    expect(admin.database(app)).toBe(app.database());
  });

  it('should return the default app\'s auth object', () => {
    const defaultApp = admin.app();
    expect(admin.auth()).toBe(defaultApp.auth());
  });

  it('should return the default app\'s database object', () => {
    const defaultApp = admin.app();
    expect(admin.database()).toEqual(defaultApp.database());
  });

  // INTERNALS
  it('should delete an app when calling _deleteApp', () => {
    admin.initializeApp({}, 'APP_NAME');
    admin._deleteApp('APP_NAME');
    expect(() => admin.app('APP_NAME')).toThrow();
  });
});
