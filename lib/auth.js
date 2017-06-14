'use strict';

module.exports = class Auth {
  constructor(app) {
    this.app = app;

    this.createCustomToken = () => {};
    this.createUser = () => {};
    this.deleteUser = () => {};
    this.getUser = () => {};
    this.getUserByEmail = () => {};
    this.updateUser = () => {};
    this.verifyIdToken = () => {};
  }
};
