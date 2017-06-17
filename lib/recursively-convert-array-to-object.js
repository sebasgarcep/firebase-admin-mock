'use strict';

const UndefinedNotAllowedError = require('./errors/undefined-not-allowed');

// converts Array to Map
const recursivelyConvertArrayToObject = (data) => {
  if (data === undefined) {
    throw new UndefinedNotAllowedError();
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  const result = {};
  Object.keys(data).forEach((key) => {
    result[key] = recursivelyConvertArrayToObject(data[key]);
  });
  return result;
};

module.exports = recursivelyConvertArrayToObject;
