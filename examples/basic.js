'use strict';

const { constants: { DEFAULT_DATABASE_URL }, AdminRoot } = require('../lib');

const admin = new AdminRoot();

admin.initializeApp({
  databaseUrl: DEFAULT_DATABASE_URL,
});

const database = admin.database();

database.setMockData({ foo: 'bar' });

admin.database()
  .ref()
  .on('child_changed', (dataSnapshot) => {
    console.log(dataSnapshot.val());
  });

admin.database()
  .ref('key1')
  .push({ foo: 'bar' });

// console.log(admin.database().getMockData());
