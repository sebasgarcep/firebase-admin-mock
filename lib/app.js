'use strict';

const Auth = require('./auth');
const Database = require('./database');
const UninitializedAppError = require('./errors/uninitialized-app');

class App {
  constructor(deleteApp, options, name) {
    if (!options) {
      throw new Error('No options passed to the App object');
    }
    this.options = options;
    this.name = name;
    this._authInstance = new Auth(this);
    this._databaseInstance = new Database(this);
    this.auth = () => this._authInstance;
    this.database = () => this._databaseInstance;
    this.delete = () => {
      deleteApp();
      delete this.options;
      delete this.name;
      delete this._authInstance;
      delete this._databaseInstance;
      this.auth = () => {
        throw new UninitializedAppError(name);
      };
      this.database = () => {
        throw new UninitializedAppError(name);
      };
      return Promise.resolve();
    };
  }
}

module.exports = App;
