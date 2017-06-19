'use strict';

module.exports = class AuthError extends Error {
  constructor(type) {
    super();
    this.code = `auth/${type}`;
  }
};
