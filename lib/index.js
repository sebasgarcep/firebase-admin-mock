'use strict';

const App = require('./app');
const UninitializedAppError = require('./errors/uninitialized-app');
const constants = require('./constants');

// classes to expose
const Database = require('./database');
const DataSnapshot = require('./data-snapshot');
const onDisconnect = require('./on-disconnect');
const Query = require('./query');
const Reference = require('./reference');
const ThenableReference = require('./thenable-reference');

const Auth = require('./auth');
const DecodedIdToken = require('./decoded-id-token');
const UserInfo = require('./user-info');
const UserMetadata = require('./user-metadata');
const UserRecord = require('./user-record');

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
    this.auth.Auth = Auth;
    this.auth.DecodedIdToken = DecodedIdToken;
    this.auth.UserInfo = UserInfo;
    this.auth.UserMetadata = UserMetadata;
    this.auth.UserRecord = UserRecord;

    this.credential = {};

    this.database = (app) => {
      if (app) {
        return app.database();
      }
      return this.app().database();
    };
    this.database.Database = Database;
    this.database.DataSnapshot = DataSnapshot;
    this.database.onDisconnect = onDisconnect;
    this.database.Query = Query;
    this.database.Reference = Reference;
    this.database.ThenableReference = ThenableReference;

    this.messaging = (app) => {
      if (app) {
        return app.messaging();
      }
      return this.app().messaging();
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
