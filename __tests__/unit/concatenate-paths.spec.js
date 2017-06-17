'use strict';

const concatenatePaths = require('../../lib/concatenate-paths');

describe('concatenatePaths testing suite', () => {
  it('should run without inputs', () => {
    expect(concatenatePaths()).toEqual(expect.anything());
  });

  it('should return an empty array for no inputs', () => {
    expect(concatenatePaths()).toEqual(expect.anything());
  });

  it('should concatenate an arbitrary number of inputs correctly', () => {
    expect(concatenatePaths('child', 'toy')).toEqual(['child', 'toy']);
    expect(concatenatePaths('child/toy', 'name')).toEqual(['child', 'toy', 'name']);
    expect(concatenatePaths('/child', '/toy')).toEqual(['child', 'toy']);
  });
});
