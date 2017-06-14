'use strict';

const Reference = require('../lib/reference');

let ref;
describe('Reference testing suite', () => {
  beforeEach(() => {
    ref = new Reference();
  });

  it('should return an auth object', () => {
    ref = new Reference();
    expect(ref).toEqual(expect.anything());
  });

  it('should return a different auth object every time it is called', () => {
    const ref2 = new Reference();
    expect(ref).not.toBe(ref2);
  });
});
