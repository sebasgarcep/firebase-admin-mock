'use strict';

/*
  Config structure:
  - order: object
    - by: 'key' | 'child' | 'value'
    - path: string (only if order.by === 'child') | void
  - filter: object | void
    - min: any | void
    - max: any | void
  - limit: object | void
    - by: 'first' | 'last'
    - amount: integer

  The data parameter may be null, a scalar or an ImmutableJS object.
*/

const getPaths = require('./get-paths');
const getValue = require('./get-value');

const isNumeric = /^[0-9]+$/;

const UPPER_LIMIT = Math.pow(2, 32); // eslint-disable-line no-restricted-properties
const sortByKey = (a, b) => {
  let parsedA;
  let parsedB;
  let isNumA = false;
  let isNumB = false;

  if (isNumeric.test(a)) {
    parsedA = parseInt(a, 10);
    isNumA = !isNaN(parsedA) && parsedA >= 0 && parsedA < UPPER_LIMIT;
  }

  if (isNumeric.test(b)) {
    parsedB = parseInt(b, 10);
    isNumB = !isNaN(parsedB) && parsedB >= 0 && parsedB < UPPER_LIMIT;
  }

  // both are 32 bit integers
  if (isNumA && isNumB) {
    return parsedA - parsedB;
  }

  // only a is a 32 bit integer
  if (isNumA) {
    return -1;
  }

  // only b is a 32 bit integer
  if (isNumB) {
    return 1;
  }

  // none are 32 bit integers
  return (a < b) ? -1 : 1;
};

// rank value by level to make sorting easier to implement
const getLevel = (value) => {
  if (value === null) {
    return 0;
  }

  if (value === false) {
    return 1;
  }

  if (value === true) {
    return 2;
  }

  if (typeof value === 'number') {
    return 3;
  }

  if (typeof value === 'string') {
    return 4;
  }

  return 5;
};

const getFilterFunc = (getValueForKey, comparison) => (min, max) => (key) => {
  const value = getValueForKey(key);
  return (min === undefined || comparison(min, value) <= 0) &&
    (max === undefined || comparison(value, max) <= 0);
};

const compareByValue = (a, b) => {
  const levelA = getLevel(a);
  const levelB = getLevel(b);

  // If levels are different then just return the difference
  if (levelA !== levelB) {
    return levelA - levelB;
  }

  // here both levels are equal
  // level 3 is numeric, level 4 is string
  if (levelA === 3 || levelA === 4) {
    if (a !== b) {
      return (a < b) ? -1 : 1;
    }
  }

  return 0;
};

const sortByValue = (data, nestesKeys = []) => (keyA, keyB) => {
  const a = getValue(data, keyA, ...nestesKeys);
  const b = getValue(data, keyB, ...nestesKeys);

  const comparison = compareByValue(a, b);
  if (comparison !== 0) {
    return comparison;
  }

  // if no other rules determine a winner, sort lexicographically by key
  return (keyA < keyB) ? -1 : 1;
};

module.exports = (data, config) => {
  if (!config) {
    throw new Error('A second parameter specifying how the children will be queried is required');
  }

  const { order, filter, limit } = config;

  if (data === null || typeof data !== 'object') {
    return [];
  }

  let keys = data.keySeq();

  let sortingFunc;
  let paths;
  if (order.by === 'key') {
    sortingFunc = sortByKey;
  } else if (order.by === 'value') {
    sortingFunc = sortByValue(data);
  } else if (order.by === 'child') {
    paths = getPaths(order.path);
    sortingFunc = sortByValue(data, paths);
  }

  if (filter) {
    const { min, max } = filter;

    let filterFunc;
    if (order.by === 'key') {
      filterFunc = getFilterFunc(key => key, sortingFunc);
    } else if (order.by === 'value') {
      filterFunc = getFilterFunc(key => getValue(data, key), compareByValue);
    } else if (order.by === 'child') {
      filterFunc = getFilterFunc(key => getValue(data, key, ...paths), compareByValue);
    }

    keys = keys.filter(filterFunc(min, max));
  }

  keys = keys.sort(sortingFunc);

  if (limit) {
    const { by, amount } = limit;

    if (by === 'first') {
      keys = keys.slice(0, amount); // get indexes 0 <= index < amount
    } else {
      keys = keys.slice(-amount); // get last N indexes
    }
  }

  return keys.toArray();
};
