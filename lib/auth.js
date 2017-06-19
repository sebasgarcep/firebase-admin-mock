'use strict';

const Immutable = require('immutable');
const randomstring = require('randomstring');

const AuthError = require('./errors/auth');
const UserRecord = require('./user-record');
const emailValidator = require('email-validator');
const validUrl = require('valid-url');

module.exports = class Auth {
  constructor(app) {
    this.app = app;
    this._users = Immutable.Map();

    // this.createCustomToken = () => {};

    this.createUser = (propertiesOriginal) => {
      let properties;
      try {
        properties = this._validateUserProperties(propertiesOriginal);
      } catch (error) {
        return Promise.reject(error);
      }

      if (!properties.email) {
        return Promise.reject(new AuthError('invalid-email'));
      }

      if (!properties.disabled) {
        properties.disabled = false;
      }

      if (!properties.displayName) {
        properties.displayName = null;
      }

      if (!properties.emailVerified) {
        properties.emailVerified = false;
      }

      if (!properties.photoURL) {
        properties.photoURL = false;
      }

      if (!properties.uid) {
        do {
          properties.uid = randomstring.generate({ length: 28 });
        } while (this._users.has(properties.uid));
      }

      this._users.set(properties.uid, Immutable.Map(properties));

      return Promise.resolve(new UserRecord(properties));
    };

    this.deleteUser = (uid) => {
      if (!this._users.has(uid)) {
        return Promise.reject(new AuthError('user-not-found'));
      }

      this._users = this._users.delete(uid);
      return Promise.resolve();
    };

    this.getUser = (uid) => {
      const userData = this._users.get(uid);

      if (!userData) {
        return Promise.reject(new AuthError('user-not-found'));
      }

      return Promise.resolve(new UserRecord(userData));
    };

    this.getUserByEmail = (email) => {
      const userData = this._users.find(value => value.email === email);

      if (!userData) {
        return Promise.reject(new AuthError('user-not-found'));
      }

      return Promise.resolve(new UserRecord(userData));
    };

    this.updateUser = (uid, propertiesOriginal) => {
      let properties;

      try {
        properties = this._validateUserProperties(propertiesOriginal, { update: true });
      } catch (error) {
        return Promise.reject(error);
      }

      return this.getUser(uid)
        .then(userData => userData.merge(Immutable.Map(properties)));
    };

    // this.verifyIdToken = () => {};

    // INTERNALS
    this._validateUserProperties = (propertiesOriginal, options) => {
      const properties = {};
      Object.keys(propertiesOriginal).forEach((key) => {
        const data = propertiesOriginal[key];
        if (data === undefined) {
          return;
        }

        properties[key] = data;

        if (key === 'email') {
          if (!emailValidator.validate(properties.email)) {
            throw new AuthError('invalid-email');
          }
        } else if (key === 'uid') {
          if (options.update) {
            throw new AuthError('uid-already-exists');
          }
          if (typeof properties.uid !== 'string' ||
            properties.uid.length === 0 || properties.uid.length > 128) {
            throw new AuthError('invalid-uid');
          }
        } else if (key === 'disabled') {
          if (typeof properties.disabled !== 'boolean') {
            throw new AuthError('invalid-disabled-field');
          }
        } else if (key === 'displayName') {
          if (typeof properties.displayName !== 'string' || properties.displayName.length === 0) {
            throw new AuthError('invalid-display-name');
          }
        } else if (key === 'emailVerified') {
          if (typeof properties.emailVerified !== 'boolean') {
            throw new AuthError('invalid-email-verified');
          }
        } else if (key === 'photoURL') {
          if (!validUrl.isUri(properties.photoURL)) {
            throw new AuthError('invalid-photo-url');
          }
        } else if (key === 'password') {
          if (typeof properties.password !== 'string' || properties.password.length < 6) {
            throw new AuthError('invalid-password');
          }
        } else {
          throw new AuthError('invalid-argument');
        }
      });

      return properties;
    };

    // TESTING UTILITIES
    this.setMockData = (data) => {
      if (typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('User authentication data must be an object/map');
      }
      this._users = Immutable.fromJS(data);
    };

    this.purgeMockData = () => {
      this._users = Immutable.Map();
    };

    this.getMockData = () => this._users.toJS();
  }
};
