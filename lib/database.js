'use strict';

const Immutable = require('immutable');
const url = require('url');

const Reference = require('./reference');
const getValue = require('./get-value');
const reconciliation = require('./reconciliation');
const recursivelyConvertArrayToObject = require('./recursively-convert-array-to-object');
const validateDataTree = require('./validate-data-tree');
const { eventTypes } = require('./constants');

const getInitialCallbackSettings = () =>
  eventTypes.reduce((acc, key) => {
    acc[key] = {};
    return acc;
  }, {});

module.exports = class Database {
  constructor(app) {
    this._online = true;
    this._data = Immutable.fromJS(null);
    this._callbacks = getInitialCallbackSettings();
    // this.ref = path => new Reference(app, path);

    this.goOffline = () => {

    };

    this.goOnline = () => {

    };

    this.ref = path => new Reference(app, path);

    this.refFromURL = (ref) => {
      const refUrl = url.parse(ref);

      if (refUrl.hostname !== app.options.databaseUrl) {
        throw new Error(`Invalid url ${ref}. Hostname should be ${app.options.databaseUrl}`);
      }

      return this.ref(refUrl.pathname);
    };

    // TESTING UTILITIES
    this.setMockData = (data) => {
      this._data = Immutable.fromJS(validateDataTree(data));
    };
    this.purgeMockData = () => {
      this._data = Immutable.fromJS(null);
    };
    this.getMockData = () => this._data.toJS();

    // INTERNALS
    // fetches data as an ImmutableJS object
    this._getData = () => this._data;

    // transforms the data correctly into ImmutableJS
    this._makeImmutable = (data) => {
      const parsedData = recursivelyConvertArrayToObject(data);
      return Immutable.fromJS(parsedData);
    };

    this._fireCallbacks = (eventType, location, index) => {
      const reference = new Reference(app, location);
      const snapshot = reference._getDataSnapshot();
      const callbackMap = this._callbacks[eventType][location];

      if (callbackMap) {
        if (index) {
          const callback = this._callbacks[eventType][location][index];
          callback(snapshot);
          return;
        }

        Object.keys(callbackMap).forEach((uuid) => {
          const callback = callbackMap[uuid];
          // fire event
          callback(snapshot);
        });
      }
    };

    this._registerCallback = (eventType, location, index, callback) => {
      if (!this._callbacks[eventType][location]) {
        this._callbacks[eventType][location] = {};
      }
      this._callbacks[eventType][location][index] = callback;
      if (eventType === 'value') {
        this._fireCallbacks(eventType, location, index);
      }
    };

    this._unregisterCallback = (eventType, location, index) => {
      if (!eventType) {
        this._callbacks = getInitialCallbackSettings();
        return;
      }
      if (!location) {
        this._callbacks[eventType] = {};
        return;
      }
      delete this._callbacks[eventType][location][index];
    };

    this._getValue = (...keys) => getValue(this._data, ...keys);

    // Calling this function implies the caller has verified that the inputted
    // data tree is valid.
    // Sets ImmutableJS object as data
    this._setData = (data) => {
      const updates = reconciliation(this._data, data);
      for (let i = updates.length - 1; i >= 0; i -= 1) { // eslint-disable-line
        const update = updates[i];
        this._fireCallbacks(update.type, update.path);
      }
      this._data = data;
      return data;
    };
  }

};
