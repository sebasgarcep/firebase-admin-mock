'use strict';

/*
*
*  Check that all values in a tree are not undefined, otherwise throws an error
*  and removes all null values from the tree;
*
*/

const UndefinedNotAllowedError = require('./errors/undefined-not-allowed');
const getPaths = require('./get-paths');

const traverseTree = (options, validatedTree, tree) => {
  Object.keys(tree).forEach((key) => {
    const data = tree[key];

    if (data === undefined) {
      throw new UndefinedNotAllowedError();
    }

    if (data === null && !options.doNotStripNull) {
      return;
    }

    let result;
    if (data !== null && typeof data === 'object') {
      const nextLevel = {};
      traverseTree(options, nextLevel, data);
      if (Object.keys(nextLevel).length === 0) {
        return;
      }
      result = nextLevel;
    } else {
      result = data;
    }

    const paths = getPaths(key);
    let root = validatedTree;
    paths.forEach((path, index) => {
      if (index === paths.length - 1) {
        root[path] = result;
      } else {
        root[path] = {};
        root = root[path];
      }
    });
  });
};

module.exports = (tree, options = {}) => {
  if (tree === undefined) {
    throw new UndefinedNotAllowedError();
  }
  if (tree === null || typeof tree !== 'object') {
    return tree;
  }
  const validatedTree = {};
  traverseTree(options, validatedTree, tree);

  if (Object.keys(validatedTree).length === 0) {
    return null;
  }

  return validatedTree;
};
