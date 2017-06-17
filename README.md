# Firebase Admin Mock

### Notice

ALPHA SOFTWARE. USE AT YOUR OWN RISK.

### Installing

To install just:

```
$ npm install --save firebase-admin-mock
```

or if you prefer `yarn`:
```
$ yarn add firebase-admin-mock
```

### Get Started

Unlike `firebase-admin` we do not export the `admin` object, but an `AdminRoot` constructor for the `admin` object.

```javascript
const {
  AdminRoot,
} = require('firebase-admin-mock');

const admin = new AdminRoot();
```

This is so you can easily replace the `admin` object on each individual test, if you need to, instead of doing cleanup. In jest it would look something like this.

```javascript
let admin;
describe('testing suite', () => {
  beforeEach(() => {
    admin = new AdminRoot();
  });
});
```

### API

We implement the same API as `firebase-admin` but we've added some useful testing methods.

### admin.database()

##### setMockData(data: null | string | number | boolean | object): void
Validates that `data` is a valid Firebase data tree i.e. it has no `undefined` properties, and transforms the data tree when necessary, e.g by stripping away `null` properties and transforming nested keys like `foo/bar` into `foo: { bar: ... }`. This method runs without firing event handlers so it is useful for setting the initial state of the database one might expect.

### getMockData(): null | string | number | boolean | object
Returns the validated and parsed data tree.

### purgeMockData(): void
Deletes the data tree without firing event handlers.

### Checklist
- [ ] Auth
- [x] Realtime Database
  - Missing `child_moved` events
  - Missing an implementation for priorities
- [ ] Messaging

### What we are not

The idea of this library is to locally test the soundness of the code you write against Firebase. This is not meant to act as a replacement for Firebase or any of its products.
