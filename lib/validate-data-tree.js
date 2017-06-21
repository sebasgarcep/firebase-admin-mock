'use strict';

/*
*
*  Check that all values in a tree are not undefined, otherwise throws an error
*  and removes all null values from the tree;
*
*/

const InvalidFirebaseKeyError = require('./errors/invalid-firebase-key');
const UndefinedNotAllowedError = require('./errors/undefined-not-allowed');
const validFirebaseKey = require('./valid-firebase-key');

const traverseTree = (validatedTree, tree) => {
  // go through all keys in the object
  Object.keys(tree).forEach((key) => {
    // check whether this key is valid before doing any work
    if (!validFirebaseKey(key)) {
      throw new InvalidFirebaseKeyError(key);
    }

    const data = tree[key];

    // if the value of this key is undefined throw an error
    if (data === undefined) {
      throw new UndefinedNotAllowedError();
    }

    // if the value of this key is null ignore this key
    if (data === null) {
      return;
    }

    // if this is a scalar, just add it to the validated data tree and jump to the
    // next iteration
    if (typeof data !== 'object') {
      validatedTree[key] = data; // eslint-disable-line no-param-reassign
      return;
    }

    // this is an object
    // we have to go one level deeper
    const nextLevel = {};
    traverseTree(nextLevel, data);

    // if all keys were ignored then the object is empty and we should ignore it
    if (Object.keys(nextLevel).length === 0) {
      return;
    }

    // otherwise add it the next level to the  data tree
    validatedTree[key] = nextLevel; // eslint-disable-line no-param-reassign
  });
};

module.exports = (tree) => {
  // if the tree is undefined throw an error
  if (tree === undefined) {
    throw new UndefinedNotAllowedError();
  }

  // if is a scalar just return early
  if (tree === null || typeof tree !== 'object') {
    return tree;
  }

  // otherwise we have to do the hard work of recursively validating the tree
  const validatedTree = {};
  traverseTree(validatedTree, tree);

  // if the validated data tree turns up empty we have to return null
  if (Object.keys(validatedTree).length === 0) {
    return null;
  }

  return validatedTree;
};
