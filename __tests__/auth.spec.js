'use strict';

const Auth = require('../lib/auth');

let auth;
describe('Auth testing suite', () => {
  beforeEach(() => {
    auth = new Auth();
  });

  it('should return an auth object', () => {
    auth = new Auth();
    expect(auth).toEqual(expect.anything());
  });

  it('should return a different auth object every time it is called', () => {
    const auth2 = new Auth();
    expect(auth).not.toBe(auth2);
  });
});
