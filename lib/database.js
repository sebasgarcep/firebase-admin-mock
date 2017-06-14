'use strict';

const Immutable = require('immutable');

const Reference = require('./reference');
const validateDataTree = require('./validate-data-tree');

module.exports = class Database {
  constructor(app) {
    this._online = true;
    this._data = Immutable.fromJS(null);
    // this.ref = path => new Reference(app, path);

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

    // converts Array to Map
    const _recursivelyConvertArraysToMaps = (data) => {
      if (data === null || typeof data !== 'object') {
        return data;
      }
      const result = {};
      Object.keys(data).forEach((key) => {
        result[key] = _recursivelyConvertArraysToMaps(data[key]);
      });
      return result;
    };

    // transforms the data correctly into ImmutableJS
    this._makeImmutable = (data) => {
      const parsedData = _recursivelyConvertArraysToMaps(data);
      return Immutable.fromJS(parsedData);
    };

    // sets ImmutableJS object as data
    this._setData = (data) => {
      // TODO: perform reconciliation algorithm and fire events
      this._data = data;
      return data;
    };
  }

};
