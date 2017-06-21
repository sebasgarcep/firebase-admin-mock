'use strict';

/*
  Scans both trees (ImmutableJS Maps or null each) arbitrarily deep and creates
  a list of all changes in the tree. Assumes both trees are valid Firebase data
  trees
*/

const { UPDATES } = require('./constants');

const goOneLevelDeep = (updates, key, location, prev, next) => {
  updates[key] = {}; // eslint-disable-line no-param-reassign
  /* eslint-disable no-use-before-define */
  recursiveReconciliation(updates[key], location, [...location, key], prev, next);
  /* eslint-enable no-use-before-define */
  if (!updates[key][UPDATES]) {
    delete updates[key]; // eslint-disable-line no-param-reassign
  }
};

const recursiveReconciliation = (updates, parentLocation, location, prev, next) => {
  // check if item is an object considering null a scalar
  const prevIsObject = prev !== null && typeof prev === 'object';
  const nextIsObject = next !== null && typeof next === 'object';

  // If both are equal ImmutableJS Maps there is nothing else to check here
  if (prev === next || (prevIsObject && nextIsObject && prev.equals(next))) {
    return;
  }

  // the event type
  let type;
  if (prev === null) {
    type = 'added';
  } else if (next === null) {
    type = 'removed';
  } else {
    type = 'changed';
  }

  const updateData = {
    type,
    location,
    path: location.join('/'),
    parentLocation,
    parentPath: parentLocation !== null ? parentLocation.join('/') : null,
  };

  updates[UPDATES] = updateData; // eslint-disable-line no-param-reassign

  // both are scalars, stop looking
  if (!prevIsObject && !nextIsObject) {
    return;
  }

  // prev is an object and next is a scalar
  if (prevIsObject && !nextIsObject) {
    prev.forEach((child, childKey) => {
      goOneLevelDeep(updates, childKey, location, child, null);
    });
    return;
  }

  // prev is a scalar and next is an object
  if (!prevIsObject && nextIsObject) {
    next.forEach((child, childKey) => {
      goOneLevelDeep(updates, childKey, location, null, child);
    });
    return;
  }

  // both are objects
  const keys = {};
  for (const key of prev.keys()) { // eslint-disable-line no-restricted-syntax
    keys[key] = {
      prev: true,
      next: false,
    };
  }
  for (const key of next.keys()) { // eslint-disable-line no-restricted-syntax
    if (keys[key]) {
      keys[key].next = true;
    } else {
      keys[key] = {
        prev: false,
        next: true,
      };
    }
  }

  // go down one level
  Object.keys(keys).forEach((key) => {
    const prevChild = keys[key].prev ? prev.get(key) : null;
    const nextChild = keys[key].next ? next.get(key) : null;
    goOneLevelDeep(updates, key, location, prevChild, nextChild);
  });
};

module.exports = (prev, next) => {
  const updates = {};
  const location = [];
  recursiveReconciliation(updates, null, location, prev, next);

  // If nothing updated the root element should have no keys
  if (Object.keys(updates).length === 0) {
    return null;
  }

  // otherwise return the updates
  return updates;
};
