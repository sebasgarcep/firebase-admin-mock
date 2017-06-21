'use strict';

const Immutable = require('immutable');
const getValue = require('./get-value');
const validateDataTree = require('./validate-data-tree');

module.exports = (root, valueDirty, keys = []) => {
  // make sure what we are about to enter is valid
  const value = validateDataTree(valueDirty);

  // just set the value freely
  if (value !== null) {
    const immutableValue = Immutable.fromJS(value);
    // check if root is a scalar
    if (root === null || typeof root !== 'object') {
      const map = Immutable.Map();
      return map.setIn(keys, immutableValue);
    }

    return root.setIn(keys, immutableValue);
  }
  // the value is null => this counts as a delete
  // if there is nothing at this position then we can move one without worry
  if (getValue(root, keys) === null) {
    return root;
  }

  // otherwise we have to recursively delete until we have a valid data tree
  let data = root.deleteIn(keys);
  for (let level = keys.length - 1; level >= 0; level -= 1) {
    const levelKeys = keys.slice(0, level);
    // if the object at this level has at least one key stop deleting
    if (getValue(data, levelKeys).size !== 0) {
      break;
    }
    data = data.deleteIn(levelKeys);
    if (data === undefined) {
      return null;
    }
  }
  return data;
};
