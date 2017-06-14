'use strict';

const DeprecatedError = require('./errors/deprecated');
const UnimplementedError = require('./errors/unimplemented');
const concatenatePaths = require('./concatenate-paths');
const getPaths = require('./get-paths');

module.exports = class Query {
  constructor(app, path = '/') {
    this._database = app.database();
    this._pathArray = getPaths(path);

    // private
    this._order = {
      by: 'key',
    };
    this._filter = {
      min: null,
      max: null,
    };

    // Filtering functions
    this.startAt = (value) => {
      this._filter.min = value;
      return this;
    };
    this.endAt = (value) => {
      this._filter.max = value;
      return this;
    };
    this.equalTo = (value) => {
      this._filter.min = value;
      this._filter.max = value;
      return this;
    };
    this.limitToFirst = () => {};
    this.limitToLast = () => {};

    this.isEqual = () => {};

    this.orderByChild = (childPath) => {
      this._order = {
        by: 'child',
        path: childPath,
      };
      return this;
    };

    this.orderByKey = () => {
      this._order = {
        by: 'key',
      };
      return this;
    };

    this.orderByPriority = () => {
      throw new DeprecatedError('orderByPriority');
    };

    this.orderByValue = () => {
      this._order = {
        by: 'value',
      };
      return this;
    };

    this.toJSON = () => {};
    this.toString = () => `${app.options.databaseUrl}/${this._pathArray.join('/')}`;

    this.child = (childPath = {}) => new Query(app, concatenatePaths(path, childPath));

    const eventTypes = [
      'value',
      'child_added',
      'child_changed',
      'child_removed',
      'child_moved',
    ];

    this._resetCallbacks = () => {
      this._callbacks = {};
      eventTypes.forEach((eventType) => {
        this._callbacks[eventType] = {};
      });
    };


    this._uuid = 1;
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
      callback.__uuid__ = this._uuid; // eslint-disable-line no-param-reassign
      const finalCallback = context ? callback.bind(context) : callback;
      this._callbacks[eventType][this._uuid] = {
        callback: finalCallback,
        onCancel: cancelCallbackOrContext,
      };
      this._uuid += 1;
      return callback;
    };

    this.once = (eventType, callback, failureCallbackOrContext, context) => {
      return new Promise((resolve) => {
        const onceCallback = () => {
          resolve();
        };
        return this.on(eventType, onceCallback, failureCallbackOrContext, context);
      });
    };

    this.off = (eventType, callback/* , context */) => {
      if (!eventType) {
        this._resetCallbacks();
        return;
      }
      if (!eventTypes.includes(eventType)) {
        throw new Error(`Unexpected event type passed to ref: ${eventType}.`);
      }
      if (!callback) {
        this._callbacks[eventType] = {};
        return;
      }
      delete this._callbacks[eventType][callback.__uuid__];
    };
  }
};
