'use strict';

const App = require('../../lib/app');
const Auth = require('../../lib/auth');
const { defaultConfig, DEFAULT_APP_KEY } = require('../../lib/constants');

let auth;
const app = new App(() => {}, defaultConfig, DEFAULT_APP_KEY);
describe('Auth testing suite', () => {
  beforeEach(() => {
    auth = new Auth(app);
  });

  // constructor
  it('should return an auth object', () => {
    auth = new Auth();
    expect(auth).toEqual(expect.anything());
  });

  it('should return a different auth object every time it is called', () => {
    const auth2 = new Auth();
    expect(auth).not.toBe(auth2);
  });

  // .app
  it('should have an app', () => {
    expect(auth.app).toEqual(expect.anything());
  });

  it('should have its app be the same it was passed in the constructor', () => {
    expect(auth.app).toBe(app);
  });

  // .createCustomToken()
  it('should run createCustomToken without errors', () => {
    expect(() => auth.createCustomToken({})).not.toThrow();
  });

  // .createUser()
  it('should run createUser without errors', () => {
    expect(() => auth.createUser({}).catch(() => {})).not.toThrow();
  });

  it('should return a promise when running createUser with email parameter', () => {
    expect(auth.createUser({ email: 'foo@bar.com' })).toBeInstanceOf(Promise);
  });

  it('should return a resolved promise when running createUser with email parameter', () => {
    const result = auth.createUser({ email: 'foo@bar.com' });
    expect(result).resolves.toHaveProperty('uid');
    expect(result).resolves.toHaveProperty('email');
    expect(result).resolves.not.toHaveProperty('password');
  });

  it('should return a promise rejection an error when running createUser with no email', () => {
    expect(auth.createUser({})).rejects.toBeInstanceOf(Error);
  });

  // .deleteUser() -- missing tests

  // .getUser() -- missing tests

  // .getUserByEmail() -- missing tests

  // .updateUser() -- missing tests

  // .verifyIdToken()
  it('should run verifyIdToken without errors', () => {
    expect(() => auth.createCustomToken({})).not.toThrow();
  });

  // TESTING UTILITIES

  // .setMockData() -- missing tests

  // .purgeMockData() -- missing tests

  // .getMockData() -- missing tests

  // INTERNALS

  // ._validateUserProperties() -- missing tests
});
