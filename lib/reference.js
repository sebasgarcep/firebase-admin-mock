'use strict';

const DeprecatedError = require('./errors/deprecated');
const Query = require('./query');
const UndefinedNotAllowedError = require('./errors/undefined-not-allowed');
const generateFirebaseToken = require('./generate-firebase-token');
const validateDataTree = require('./validate-data-tree');

module.exports = class Reference extends Query {
  constructor(app, pathDirty = '/') {
    super(app, pathDirty);
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

    this.onDisconnect = () => {};

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
};
