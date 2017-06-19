'use strict';

const Immutable = require('immutable');
const url = require('url');

const Reference = require('./reference');
const getValue = require('./get-value');
const queryChildren = require('./query-children');
const reconciliation = require('./reconciliation');
const recursivelyConvertArrayToObject = require('./recursively-convert-array-to-object');
const validateDataTree = require('./validate-data-tree');
const { eventTypes } = require('./constants');

const getInitialCallbackSettings = () =>
  eventTypes.reduce((acc, key) => {
    acc[key] = {};
    return acc;
  }, {});

class Database {
  constructor(app) {
    this.app = app;

    this._online = true;
    this._data = Immutable.fromJS(null);
    this._callbacks = getInitialCallbackSettings();

    // this.goOffline = () => {};

    // this.goOnline = () => {};

    this.ref = path => new Reference(app, path);

    this.refFromURL = (ref) => {
      const refUrl = url.parse(ref);

      const base = `${refUrl.protocol}//${refUrl.hostname}`;
      if (base !== app.options.databaseUrl) {
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

    this._fireCallbacks = (update) => {
      this._fireValueCallback(update);
      this._fireChildCallbacks(update);
    };

    this._fireEvent = (eventType, callbackPath, dataPath, index) => {
      const reference = new Reference(app, dataPath);
      const snapshot = reference._getDataSnapshot();

      const callbackMap = this._callbacks[eventType][callbackPath];

      if (callbackMap) {
        if (index) {
          const callback = callbackMap[index];
          callback(snapshot);
          return;
        }

        Object.keys(callbackMap).forEach((uuid) => {
          const callback = callbackMap[uuid];
          callback(snapshot);
        });
      }
    };

    this._fireValueCallback = (update) => {
      const { path } = update;

      this._fireEvent('value', path, path);
    };

    this._fireChildCallbacks = (update) => {
      const { parentPath, path, type } = update;

      let eventType;
      switch (type) {
        case 'added':
          eventType = 'child_added';
          break;
        case 'changed':
          eventType = 'child_changed';
          break;
        case 'removed':
          eventType = 'child_removed';
          break;
        default:
          // unreachable;
          break;
      }

      this._fireEvent(eventType, parentPath, path);
    };

    this._registerCallback = (eventType, path, index, callback, config) => {
      if (!this._callbacks[eventType][path]) {
        this._callbacks[eventType][path] = {};
      }
      this._callbacks[eventType][path][index] = callback;

      // fire initial callbacks
      if (eventType === 'value') {
        this._fireEvent(eventType, path, path, index);
      }

      if (eventType === 'child_added') {
        const data = this._getValue(...path.split('/'));

        // should give correct iteration order
        const children = queryChildren(data, config);
        children.forEach((key) => {
          this._fireEvent(eventType, path, `${path}/${key}`, index);
        });
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
        this._fireCallbacks(update);
      }
      this._data = data;
      return data;
    };
  }
}

module.exports = Database;
