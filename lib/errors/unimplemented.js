'use strict';

module.exports = class UnimplementedError extends Error {
  constructor(feature) {
    super(`${feature} is not currently implemented. Please file an issue or +1 if it already exists.`);
  }
};
