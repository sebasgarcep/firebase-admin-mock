'use strict';

const getPaths = require('./get-paths');

module.exports = (...keys) => {
  const paths = keys.map(key => getPaths(key));
  let result = [];
  paths.forEach((path) => {
    result = result.concat(path);
  });
  return result;
};
