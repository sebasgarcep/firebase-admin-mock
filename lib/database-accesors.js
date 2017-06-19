'use strict';

const DataSnapshot = require('./data-snapshot');
const DeprecatedError = require('./errors/deprecated');
const UndefinedNotAllowedError = require('./errors/undefined-not-allowed');
const UnimplementedError = require('./errors/unimplemented');
const concatenatePaths = require('./concatenate-paths');
const generateFirebaseToken = require('./generate-firebase-token');
const getPaths = require('./get-paths');
const validateDataTree = require('./validate-data-tree');
const { eventTypes } = require('./constants');

let uuid = 1;
class Query {
  constructor(app, path = '/', config) {
    if (this.constructor === Query) {
      this.ref = new Reference(app, path); // eslint-disable-line no-use-before-define
    }

    this._app = app;
    this._database = app.database();
    this._pathArray = getPaths(path);
    this._cleanPath = this._pathArray.join('/');

    this._order = (config && config.order) || null;
    this._filter = (config && config.filter) || null;
    this._limit = (config && config.limit) || null;

    // Filtering functions
    this.startAt = value =>
      this._getInstanceCopyWithMutations((copyConfig) => {
        if (!copyConfig.filter) {
          copyConfig.filter = {}; // eslint-disable-line no-param-reassign
        }
        copyConfig.filter.min = value; // eslint-disable-line no-param-reassign
      });

    this.endAt = value =>
      this._getInstanceCopyWithMutations((copyConfig) => {
        if (!copyConfig.filter) {
          copyConfig.filter = {}; // eslint-disable-line no-param-reassign
        }
        copyConfig.filter.max = value; // eslint-disable-line no-param-reassign
      });

    this.equalTo = value =>
      this._getInstanceCopyWithMutations((copyConfig) => {
        if (!copyConfig.filter) {
          copyConfig.filter = {}; // eslint-disable-line no-param-reassign
        }
        copyConfig.filter.min = value; // eslint-disable-line no-param-reassign
        copyConfig.filter.max = value; // eslint-disable-line no-param-reassign
      });

    this.limitToFirst = (amount) => {
      if (this._limit !== null) {
        throw new Error('Cannot use another limiting method');
      }
      return this._getInstanceCopyWithMutations((copyConfig) => {
        copyConfig.limit = { // eslint-disable-line no-param-reassign
          by: 'first',
          amount,
        };
      });
    };

    this.limitToLast = (amount) => {
      if (this._limit !== null) {
        throw new Error('Cannot use another limiting method');
      }
      return this._getInstanceCopyWithMutations((copyConfig) => {
        copyConfig.limit = { // eslint-disable-line no-param-reassign
          by: 'last',
          amount,
        };
      });
    };

    this.orderByChild = (childPath) => {
      if (this._order !== null) {
        throw new Error('Cannot use an ordering method more than once');
      }
      return this._getInstanceCopyWithMutations((copyConfig) => {
        copyConfig.order = { // eslint-disable-line no-param-reassign
          by: 'child',
          path: childPath,
        };
      });
    };

    this.orderByKey = () => {
      if (this._order !== null) {
        throw new Error('Cannot use an ordering method more than once');
      }
      return this._getInstanceCopyWithMutations((copyConfig) => {
        copyConfig.order = { // eslint-disable-line no-param-reassign
          by: 'key',
        };
      });
    };

    this.orderByPriority = () => {
      throw new DeprecatedError('orderByPriority');
    };

    this.orderByValue = () => {
      if (this._order !== null) {
        throw new Error('Cannot use an ordering method more than once');
      }
      return this._getInstanceCopyWithMutations((copyConfig) => {
        copyConfig.order = { // eslint-disable-line no-param-reassign
          by: 'value',
        };
      });
    };

    this.isEqual = (other) => {
      if (this._app !== other._app) {
        return false;
      }

      if (this._cleanPath !== other._cleanPath) {
        return false;
      }

      const thisConfig = this._generateConfig();
      const otherConfig = other._generateConfig();

      if (thisConfig.order.by !== otherConfig.order.by) {
        return false;
      }

      if (thisConfig.order.by === 'child' && thisConfig.order.path !== otherConfig.order.path) {
        return false;
      }

      if ((!thisConfig.filter && otherConfig.filter) ||
        (thisConfig.filter && !otherConfig.filter)) {
        return false;
      }

      if (thisConfig.filter) {
        if (thisConfig.filter.min !== otherConfig.filter.min ||
          thisConfig.filter.max !== otherConfig.filter.max) {
          return false;
        }
      }

      if ((!thisConfig.limit && otherConfig.limit) ||
        (thisConfig.limit && !otherConfig.limit)) {
        return false;
      }

      if (thisConfig.limit) {
        if (thisConfig.limit.by !== otherConfig.limit.by ||
          thisConfig.limit.amount !== otherConfig.limit.amount) {
          return false;
        }
      }

      return true;
    };

    /*
    this.toJSON = () => {
      const data = this._database._getData();
      return data.toJS();
    };
    */

    this.toString = () => `${app.options.databaseUrl}/${this._pathArray.join('/')}`;

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
    this._generateConfig = () => {
      const configResult = { order: { by: 'key' } };
      if (this._order) {
        configResult.order = this._order;
      }
      if (this._filter) {
        configResult.filter = this._filter;
      }
      if (this._limit) {
        configResult.limit = this._limit;
      }
      return configResult;
    };

    this._getDataSnapshot = () => {
      const dataConfig = this._generateConfig();
      const data = this._database._getValue(...this._pathArray);
      return new DataSnapshot(this.ref, data, dataConfig);
    };

    this._getInstanceCopyWithMutations = (mutations) => {
      const copyConfig = this._generateConfig();
      mutations(copyConfig);
      return new Query(app, path, copyConfig);
    };
  }
}

exports.Query = Query;

class Reference extends Query {
  constructor(app, path = '/') {
    super(app, path);
    if (this.constructor === Reference) {
      this.ref = this;
    }
    if (this._pathArray.length === 0) {
      this.key = null;
      this.parent = null;
      this.root = this;
    } else {
      this.key = this._pathArray[this._pathArray.length - 1];
      this.parent = new Reference(app, this._pathArray.slice(0, this._pathArray.length - 1).join('/'));
      this.root = new Reference(app, '/');
    }

    // this.onDisconnect = () => {};

    this.push = (value, onComplete) => {
      const data = this._database._getData();
      const firebaseId = generateFirebaseToken();
      const child = this._database._makeImmutable(value);
      const newData = data.setIn([...this._pathArray, firebaseId], child);
      this._database._setData(newData);
      if (onComplete) {
        onComplete();
      }
    };

    this.remove = (onComplete) => {
      const data = this._database._getData();
      let newData;
      if (this._pathArray.length > 0) {
        newData = data.deleteIn(this._pathArray);
      } else {
        newData = null;
      }
      this._database._setData(newData);
      onComplete();
    };

    this.set = (value, onComplete) => {
      if (value === undefined) {
        throw new UndefinedNotAllowedError();
      }

      const data = this._database._getData();
      const child = this._database._makeImmutable(value);
      const newData = data.setIn(this._pathArray, child);
      this._database._setData(newData);
      onComplete();
    };

    this.setPriority = () => {
      throw new DeprecatedError('setPriority');
    };
    this.setWithPriority = () => {
      throw new DeprecatedError('setWithPriority');
    };

    this.transaction = (transactionUpdate, onComplete, applyLocally) => {};

    this.child = (childPath = '/') =>
      new Reference(app, concatenatePaths(path, childPath).join('/'));

    this.update = (values, onComplete) => {
      if (values === undefined) {
        throw new UndefinedNotAllowedError();
      }

      if (values === null) {
        return this.remove(onComplete);
      }

      if (typeof values !== 'object') {
        return this.set(values, onComplete);
      }

      try {
        // FIXME if values are null validateDataTree removes them
        const updateTree = validateDataTree(values, { doNotStripNull: true });
      } catch (error) {
        onComplete(error);
        return Promise.reject(error);
      }

      return Promise.resolve();
    };
  }
}

exports.Reference = Reference;
