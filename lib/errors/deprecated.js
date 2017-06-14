'use strict';

module.exports = class DeprecatedError extends Error {
  constructor(feature) {
    super(`${feature} is deprecated.`);
  }
};
