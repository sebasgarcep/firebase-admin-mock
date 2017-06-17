'use strict';

const getPaths = require('./get-paths');
const queryChildren = require('./query-children');

module.exports = class DataSnapshot {
  constructor(ref, data, config = { order: { by: 'key' } }) {
    this.ref = ref;
    this.key = this.ref.key;
    this._data = data;

    const _paths = getPaths(this.key);
    if (_paths.length === 0) {
      this.key = null;
    } else {
      this.key = _paths[_paths.length - 1];
    }

    const childKeys = queryChildren(data, config);
    const childKeyMap = {};
    childKeys.forEach((childKey) => {
      childKeyMap[childKey] = true;
    });

    this.child = (childKey) => {
      if (!childKeyMap[childKey]) {
        return new DataSnapshot(ref.child(childKey), null);
      }
      return new DataSnapshot(ref.child(childKey), data.get(childKey));
    };

    this.exists = () => this._data !== null;

    // priorities are deprecated
    this.exportVal = () => this.val();

    this.forEach = (callback) => {
      for (const childKey of childKeys) { // eslint-disable-line
        const childSnapshot = this.child(childKey);
        if (callback(childSnapshot)) {
          return true;
        }
      }
      return false;
    };

    this.val = () => {
      if (this._data === null || typeof this._data !== 'object') {
        return this._data;
      }
      return this._data.toJS();
    };
  }
};
