'use strict';

module.exports = class UndefinedNotAllowedError extends Error {
  constructor() {
    super('Undefined is not allowed in the data tree.');
  }
};
