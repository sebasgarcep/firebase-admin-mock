'use strict';

const { AdminRoot, defaultConfig } = require('../lib');

const admin = new AdminRoot();

admin.initializeApp(defaultConfig);

admin.database().setMockData({ foo: 'bar' });

admin.database().ref('test').once('value')
  .then((dataSnapshot) => {
    // eslint-disable-next-line no-console
    console.log(`Complete! ${dataSnapshot.key}`);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.log(`Error:  ${error.message}`);
  });
