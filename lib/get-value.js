'use strict';

// Returns values arbitrarily deep into the data tree, assuming the data tree is
// already validated.
module.exports = (root, ...keys) => {
  let data = root;
  keys.every((key) => {
    if (data === null || typeof data !== 'object') {
      data = null;
      return false;
    }
    data = data.get(key);
    return true;
  });
  if (data === undefined || data === null) {
    return null;
  }
  return data;
};
