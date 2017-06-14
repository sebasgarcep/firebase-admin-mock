'use strict';

const generateFirebaseToken = require('../lib/generate-firebase-token');

describe('generateFirebaseToken testing suite', () => {
  it('should run without errors with no arguments', () => {
    expect(() => generateFirebaseToken()).not.toThrow();
  });

  it('should return a string', () => {
    expect(typeof generateFirebaseToken()).toBe('string');
  });

  it('should return a string of length 20', () => {
    expect(generateFirebaseToken().length).toBe(20);
  });

  it('should generate strings in lexicographic ascending order', () => {
    const token1 = generateFirebaseToken();
    const token2 = generateFirebaseToken();
    expect(token1 < token2).toBe(true);
  });
});
