'use strict';

/*
*
*  Check that all values in a tree are not undefined, otherwise throws an error
*  and removes all null values from the tree;
*
*/
const traverseTree = (validatedTree, tree) => {
  Object.keys(tree).forEach((key) => {
    const data = tree[key];
    if (data === undefined) {
      throw new Error('Undefined is not allowed in the data tree.');
    }
    if (data === null) {
      return;
    }
    if (typeof data === 'object') {
      const nextLevel = {};
      traverseTree(nextLevel, data);
      if (Object.keys(nextLevel).length > 0) {
        validatedTree[key] = nextLevel; // eslint-disable-line no-param-reassign
      }
      return;
    }
    validatedTree[key] = data; // eslint-disable-line no-param-reassign
  });
};

module.exports = (tree) => {
  if (tree === undefined) {
    throw new Error('Undefined is not allowed in the data tree.');
  }
  if (tree === null || typeof tree !== 'object') {
    return tree;
  }
  const validatedTree = {};
  traverseTree(validatedTree, tree);

  if (Object.keys(validatedTree).length === 0) {
    return null;
  }

  return validatedTree;
};
