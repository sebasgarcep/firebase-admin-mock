'use strict';

const DataSnapshot = require('./data-snapshot');
const Reference = require('./reference');
const DeprecatedError = require('./errors/deprecated');
const UnimplementedError = require('./errors/unimplemented');
const concatenatePaths = require('./concatenate-paths');
const getPaths = require('./get-paths');
const { eventTypes } = require('./constants');

let uuid = 1;
module.exports = class Query {
  constructor(app, path = '/') {
    if (this.constructor === Query) {
      this.ref = new Reference(app, path);
    }

    this._database = app.database();
    this._pathArray = getPaths(path);
    this._cleanPath = this._pathArray.join('/');

    const initializeFilter = () => {
      if (!this._filter) {
        this._filter = {
          min: null,
          max: null,
        };
      }
    };

    // Filtering functions
    this.startAt = (value) => {
      initializeFilter();
      this._filter.min = value;
      return this;
    };
    this.endAt = (value) => {
      initializeFilter();
      this._filter.max = value;
      return this;
    };
    this.equalTo = (value) => {
      initializeFilter();
      this._filter.min = value;
      this._filter.max = value;
      return this;
    };
    this.limitToFirst = (amount) => {
      if (this._limit) {
        throw new Error('Cannot use another limiting method');
      }
      this._limit = {
        by: 'first',
        amount,
      };
    };
    this.limitToLast = (amount) => {
      if (this._limit) {
        throw new Error('Cannot use another limiting method');
      }
      this._limit = {
        by: 'last',
        amount,
      };
    };
    this.isEqual = () => {};

    this.orderByChild = (childPath) => {
      if (this._order) {
        throw new Error('Cannot use an ordering method more than once');
      }
      this._order = {
        by: 'child',
        path: childPath,
      };
      return this;
    };

    this.orderByKey = () => {
      if (this._order) {
        throw new Error('Cannot use an ordering method more than once');
      }
      this._order = {
        by: 'key',
      };
      return this;
    };

    this.orderByPriority = () => {
      throw new DeprecatedError('orderByPriority');
    };

    this.orderByValue = () => {
      if (this._order) {
        throw new Error('Cannot use an ordering method more than once');
      }
      this._order = {
        by: 'value',
      };
      return this;
    };

    this.toJSON = () => {
      const data = this._database._getData();
      return data.toJS();
    };
    this.toString = () => `${app.options.databaseUrl}/${this._pathArray.join('/')}`;

    this.child = (childPath = {}) => new this.constructor(app, concatenatePaths(path, childPath));

    this.on = (eventType, callback, cancelCallbackOrContext, context) => {
      if (eventType === 'child_moved') {
        throw new UnimplementedError('\'child_moved\' event listener');
      }
      if (cancelCallbackOrContext && typeof cancelCallbackOrContext !== 'function') {
        return this.on(eventType, callback, null, cancelCallbackOrContext);
      }
      if (!eventTypes.includes(eventType)) {
        throw new Error(`Unexpected event type passed to ref: ${eventType}.`);
      }
      if (!callback) {
        throw new Error('No callback passed to ref');
      }
      callback.__uuid__ = uuid; // eslint-disable-line no-param-reassign
      callback.__location__ = this._cleanPath; // eslint-disable-line no-param-reassign
      const finalCallback = context ? callback.bind(context) : callback;
      /*
      this._callbacks[eventType][uuid] = {
        callback: finalCallback,
        onCancel: cancelCallbackOrContext,
      };
      */
      this._database._registerCallback(
        eventType,
        this._cleanPath,
        callback.__uuid__,
        finalCallback);
      console.log(path);
      uuid += 1;
      return callback;
    };

    this.once = (eventType, callback, failureCallbackOrContext, context) =>
      new Promise((resolve) => {
        const onceCallback = (snapshot) => {
          resolve(snapshot);
        };
        return this.on(eventType, onceCallback, failureCallbackOrContext, context);
      })
      .catch((error) => {
        console.log(error); // eslint-disable-line no-console
        throw error;
      });

    this.off = (eventType, callback/* , context */) => {
      if (!eventType) {
        this._database._unregisterCallback();
        return;
      }
      if (!eventTypes.includes(eventType)) {
        throw new Error(`Unexpected event type passed to ref: ${eventType}.`);
      }
      if (!callback) {
        this._database._unregisterCallback(eventType);
        return;
      }
      const location = callback.__location__;
      const index = callback.__uuid__;
      this._database._unregisterCallback(eventType, location, index);
    };

    // INTERNALS
    this._getDataSnapshot = () => {
      const config = { order: { by: 'key' } };
      if (this._order) {
        config.order = this._order;
      }
      if (this._filter) {
        config.filter = this.filter;
      }
      if (this._limit) {
        config.limit = this._limit;
      }
      const data = this._database._getValue(...this._pathArray);
      return new DataSnapshot(this.ref, data, config);
    };
  }
};
