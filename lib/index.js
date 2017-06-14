'use strict';

const App = require('./app');
const UninitializedAppError = require('./errors/uninitialized-app');
const constants = require('./constants');

const { DEFAULT_APP_KEY } = constants;

class AdminRoot {
  constructor() {
    this.SDK_VERSION = 'MOCK';

    this.apps = [];
    this._apps = {};

    this.auth = (app) => {
      if (app) {
        return app.auth();
      }
      return this.app().auth();
    };

    this.database = (app) => {
      if (app) {
        return app.database();
      }
      return this.app().database();
    };

    this.initializeApp = (options, name = DEFAULT_APP_KEY) => {
      if (!options.databaseUrl) {
        throw new Error('App should have the property \'databaseUrl\' set.');
      }
      if (this._apps[name]) {
        throw new Error(`App ${name} has already been initialized.`);
      }
      const app = new App(this._deleteApp, options, name);
      this.apps.push(name);
      this._apps[name] = app;
      return app;
    };

    this.app = (name = DEFAULT_APP_KEY) => {
      const app = this._apps[name];
      if (!app) {
        throw new UninitializedAppError(name);
      }
      return app;
    };

    // INTERNALS
    this._deleteApp = (name) => {
      this.apps = this.apps.filter(appName => appName !== name);
      delete this._apps[name];
    };
  }
}

module.exports = {
  AdminRoot,
  constants,
};
