'use strict';

module.exports = class InvalidFirebaseKeyError extends Error {
  constructor(key) {
    super(`${key} is not a valid firebase key. It must not contain either of '.', '[', ']', '$', '#', '/'`);
  }
};
