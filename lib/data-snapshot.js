'use strict';

const getPaths = require('./get-paths');
const concatenatePaths = require('./concatenate-paths');
const iterateChildren = require('./iterate-children');

module.exports = class DataSnapshot {
  constructor(ref, data, key = '/') {
    this.ref = ref;

    const _paths = getPaths(key);
    if (_paths.length === 0) {
      this.key = null;
    } else {
      this.key = _paths[_paths.length - 1];
    }

    this.child = childKey => new DataSnapshot(ref, data, concatenatePaths(key, childKey));

    this.exists = childKey => {
      // return this._data !== null;
    };

    this.exportVal = () => {
      return this._data;
    };

    this.forEach = (callback) => {

    };

    this.val = () => {
      return this._data;
    };
  }
};
