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
  .on('child_added', (dataSnapshot) => {
    console.log(dataSnapshot.key);
    console.log(dataSnapshot.val());
  });
