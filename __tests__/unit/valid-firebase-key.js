'use strict';

const validFirebaseKey = require('../../lib/valid-firebase-key');

describe('validateFirebaseKey testing suite', () => {
  it('should return false for keys that contain .', () => {
    expect(validFirebaseKey('.')).toBe(false);
  });

  it('should return false for keys that contain [', () => {
    expect(validFirebaseKey('[')).toBe(false);
  });

  it('should return false for keys that contain ]', () => {
    expect(validFirebaseKey(']')).toBe(false);
  });

  it('should return false for keys that contain $', () => {
    expect(validFirebaseKey('$')).toBe(false);
  });

  it('should return false for keys that contain #', () => {
    expect(validFirebaseKey('#')).toBe(false);
  });

  it('should return false for keys that contain /', () => {
    expect(validFirebaseKey('/')).toBe(false);
  });

  it('should return true for all other keys', () => {
    expect(validFirebaseKey('foo-bar')).toBe(true);
  });

  it('should return false for slashed keys that contain .', () => {
    expect(validFirebaseKey('.', true)).toBe(false);
  });

  it('should return false for slashed keys that contain [', () => {
    expect(validFirebaseKey('[', true)).toBe(false);
  });

  it('should return false for slashed keys that contain ]', () => {
    expect(validFirebaseKey(']', true)).toBe(false);
  });

  it('should return false for slashed keys that contain $', () => {
    expect(validFirebaseKey('$', true)).toBe(false);
  });

  it('should return false for slashed keys that contain #', () => {
    expect(validFirebaseKey('#', true)).toBe(false);
  });

  it('should return true for slashed keys that contain /', () => {
    expect(validFirebaseKey('/', true)).toBe(true);
  });

  it('should return true for all other slashed keys', () => {
    expect(validFirebaseKey('foo-bar', true)).toBe(true);
  });
});
