'use strict';

module.exports.DEFAULT_APP_KEY = '[DEFAULT]';
module.exports.DEFAULT_DATABASE_URL = 'https://firebase-admin-mock.firebaseio.com';
module.exports.defaultConfig = {
  databaseUrl: module.exports.DEFAULT_DATABASE_URL,
};
module.exports.eventTypes = [
  'value',
  'child_added',
  'child_changed',
  'child_removed',
  'child_moved',
];

module.exports.UPDATES = Symbol('updates');
