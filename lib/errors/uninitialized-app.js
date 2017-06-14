'use strict';

module.exports = class UninitializedAppError extends Error {
  constructor(name) {
    super(`The app ${name} is uninitialized`);
  }
};
