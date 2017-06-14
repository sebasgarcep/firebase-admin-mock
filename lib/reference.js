'use strict';

const DeprecatedError = require('./errors/deprecated');
const Query = require('./query');
const generateFirebaseToken = require('./generate-firebase-token');

module.exports = class Reference extends Query {
  constructor(app, pathDirty = '/') {
    super(app, pathDirty);
    this.ref = this;
    if (this._pathArray.length === 0) {
      this.key = null;
      this.parent = null;
      this.root = this;
    } else {
      this.key = this._paths[0];
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
      onComplete();
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

    this.transaction = () => {};
    this.update = () => {

    };
  }
};
