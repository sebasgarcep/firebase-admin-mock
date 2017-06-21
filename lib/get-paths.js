'use strict';

const InvalidFirebaseKeyError = require('./errors/invalid-firebase-key');
const validFirebaseKey = require('./valid-firebase-key');

// converts a firebase path into an array of keys
module.exports = (path) => {
  // return an empty array for falsy values
  if (!path) {
    return [];
  }

  // check if path contains invalid characters .[]$#
  if (!validFirebaseKey(path, true)) {
    throw new InvalidFirebaseKeyError(path);
  }

  // split path by slashes
  let paths = path.split('/');

  // if path begins with slash, the first element will be an empty string
  if (paths.length > 0 && paths[0] === '') {
    paths = paths.slice(1);
  }

  // if path ends with a slash the last element will be an empty string
  if (paths.length > 0 && paths[paths.length - 1] === '') {
    paths = paths.slice(0, paths.length - 1);
  }

  // empty strings anywhere else indicate the key had extra slashes and is incorrect
  if (paths.includes('')) {
    throw new InvalidFirebaseKeyError(path);
  }

  return paths;
};
