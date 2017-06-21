'use strict';

const isValidSlashedFirebaseKey = /^[^.[\]$#]+$/;
const isValidFirebaseKey = /^[^.[\]$#/]+$/;

module.exports = (key, slashed) => (slashed ?
  isValidSlashedFirebaseKey.test(key) :
  isValidFirebaseKey.test(key));
