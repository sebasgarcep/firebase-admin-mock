'use strict';

const { constants: { DEFAULT_DATABASE_URL }, AdminRoot } = require('../lib');

const admin = new AdminRoot();

admin.initializeApp({
  databaseUrl: DEFAULT_DATABASE_URL,
});

const database = admin.database();

database.setMockData({ foo: 'bar' });

console.log(admin.database()
  .ref()
  .push()
  .key);

admin.database()
  .ref()
  .limitToLast(2)
  .on('child_added', (dataSnapshot) => {
    console.log(dataSnapshot.key);
    console.log(dataSnapshot.val());
  });

admin.database()
  .ref()
  .push({ foo: 1 });

admin.database()
  .ref()
  .push({ foo: 2 });

admin.database()
  .ref()
  .push({ foo: 3 });

console.log(admin.database().getPushKeys());
