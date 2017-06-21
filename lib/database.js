'use strict';

const Immutable = require('immutable');
const url = require('url');

const DataSnapshot = require('./data-snapshot');
const Reference = require('./reference');
const getPaths = require('./get-paths');
const getValue = require('./get-value');
const queryChildren = require('./query-children');
const reconciliation = require('./reconciliation');
const validateDataTree = require('./validate-data-tree');
const { UPDATES, eventTypes } = require('./constants');

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
      const parsedData = validateDataTree(data);
      return Immutable.fromJS(parsedData);
    };

    this._registerCallback = (eventType, path, index, callback, config) => {
      if (!this._callbacks[eventType][path]) {
        this._callbacks[eventType][path] = {};
      }
      this._callbacks[eventType][path][index] = { eventType, path, index, callback, config };

      /* FIXME
      // fire initial callbacks
      if (eventType === 'value') {
        this._fireEvent(eventType, path, path, index);
      }

      if (eventType === 'child_added') {
        const data = this._getValue(getPaths(path));

        // should give correct iteration order
        const children = queryChildren(data, config);
        children.forEach((key) => {
          this._fireEvent(eventType, path, `${path}/${key}`, index);
        });
      }
      */
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

    this._getValue = keys => getValue(this._data, keys);

    this._traverseUpdateTree = (prev, next, updates) => {
      if (updates === null) {
        return;
      }

      Object.keys(updates).forEach((key) => {
        this._traverseUpdateTree(prev, next, updates[key]);
      });

      const updateInfo = updates[UPDATES];
      const { path, location } = updateInfo;
      const prevNested = getValue(prev, location);
      const nextNested = getValue(next, location);
      const reference = new Reference(app, path);
      // value event
      this._fireValueHandlers(nextNested, path, reference);
      // child_* events
      this._fireChildAddedHandlers(prevNested, nextNested, path, reference);
      this._fireChildChangedHandlers(prevNested, nextNested, path, reference, updates);
      this._fireChildRemovedHandlers(prevNested, nextNested, path, reference);
    };

    this._callbackGenerator = function* callbackGenerator(eventType, path) {
      // get all callbacks for this event and path
      const callbackMap = this._callbacks[eventType][path];

      // get list of indexes for the callbacks
      const callbackIndexes = Object.keys(callbackMap);

      for (const index of callbackIndexes) { // eslint-disable-line no-restricted-syntax
        yield callbackMap[index];
      }
    };

    this._fireValueHandlers = (nextNested, path, reference) => {
      const callbackGenerator = this._callbackGenerator('value', path);

      for (const callbackInfo of callbackGenerator) { // eslint-disable-line no-restricted-syntax
        // get callback and sort/filter config
        const { callback, config } = callbackInfo;

        // get data snapshot
        const dataSnapshot = new DataSnapshot(reference, nextNested, config);

        callback(dataSnapshot);
      }
    };

    this._childInfoGenerator = function* childInfoGenerator(
      eventType,
      prevNested,
      nextNested,
      path,
      reference) {
      const callbackGenerator = this._callbackGenerator(eventType, path);

      // initialize list to store data snapshots of children and avoid
      // redoing the same work over and over again
      const dataSnapshots = {};

      // the data passed in the snapshots depends on the event type
      let data;
      if (eventType === 'child_added') {
        data = nextNested;
      } else if (eventType === 'child_removed') {
        data = prevNested;
      }

      // lazily create snapshot to avoid heavy re-computation
      const getChildSnapshot = (key) => {
        if (!dataSnapshots[key]) {
          const refChild = reference.child(key);
          dataSnapshots[key] = new DataSnapshot(refChild, data);
        }

        return dataSnapshots[key];
      };

      for (const callbackInfo of callbackGenerator) { // eslint-disable-line no-restricted-syntax
        // get callback and sort/filter config
        const { callback, config } = callbackInfo;

        // get children of previous state
        const prevChildrenKeys = queryChildren(prevNested, config);

        // get children of next state
        const nextChildrenKeys = queryChildren(nextNested, config);

        yield { prevChildrenKeys, nextChildrenKeys, getChildSnapshot, callback };
      }
    };

    this._fireChildAddedHandlers = (prevNested, nextNested, path, reference) => {
      const childInfoGenerator = this._childInfoGenerator(
        'child_added',
        prevNested,
        nextNested,
        path,
        reference);

      for (const childInfo of childInfoGenerator) { // eslint-disable-line no-restricted-syntax
        const { prevChildrenKeys, nextChildrenKeys, getChildSnapshot, callback } = childInfo;

        // keep previous state keys in a hash map for O(1) lookups
        const prevChildrenKeyMap = prevChildrenKeys.reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {});

        let prevChildKey = null;
        nextChildrenKeys.forEach((key) => {
          // find if it was in the previous state, if not fire the
          // child_added event handler
          if (!prevChildrenKeyMap[key]) {
            // fire the callback
            callback(getChildSnapshot(key), prevChildKey);
          }

          // update key of previous child
          prevChildKey = key;
        });
      }
    };

    this._fireChildChangedHandlers = (prevNested, nextNested, path, reference, updates) => {
      const childInfoGenerator = this._childInfoGenerator(
        'child_changed',
        prevNested,
        nextNested,
        path,
        reference);

      for (const childInfo of childInfoGenerator) { // eslint-disable-line no-restricted-syntax
        const { prevChildrenKeys, nextChildrenKeys, getChildSnapshot, callback } = childInfo;

        // keep previous state keys in a hash map for O(1) lookups
        const prevChildrenKeyMap = prevChildrenKeys.reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {});

        let prevChildKey = null;
        nextChildrenKeys.forEach((key) => {
          // find if it was in the previous state
          // if it was check if there is an updates in the child's state
          if (prevChildrenKeyMap[key] && updates[key] && updates[key][UPDATES]) {
            // fire the callback
            callback(getChildSnapshot(key), prevChildKey);
          }

          // update key of previous child
          prevChildKey = key;
        });
      }
    };

    this._fireChildRemovedHandlers = (prevNested, nextNested, path, reference) => {
      const childInfoGenerator = this._childInfoGenerator(
        'child_removed',
        prevNested,
        nextNested,
        path,
        reference);

      for (const childInfo of childInfoGenerator) { // eslint-disable-line no-restricted-syntax
        const { prevChildrenKeys, nextChildrenKeys, getChildSnapshot, callback } = childInfo;

        // keep next state keys in a hash map for O(1) lookups
        const nextChildrenKeyMap = nextChildrenKeys.reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {});

        prevChildrenKeys.forEach((key) => {
          // find if it is in the next state, if not fire the
          // child_removed event handler
          if (!nextChildrenKeyMap[key]) {
            // fire the callback
            callback(getChildSnapshot(key));
          }
        });
      }
    };

    // Calling this function implies the caller has verified that the inputted
    // data tree is valid.
    // Sets ImmutableJS object as data
    this._setData = (data) => {
      const prev = this._data;
      const next = data;
      const updates = reconciliation(prev, next);
      this._data = data;

      if (updates === null) {
        return null;
      }

      this._traverseUpdateTree(prev, next, updates);

      return data;
    };
  }
}

module.exports = Database;
