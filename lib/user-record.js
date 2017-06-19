'use strict';

module.exports = class UserRecord {
  constructor(userData) {
    this.disabled = userData.disabled;
    this.displayName = userData.displayName;
    this.email = userData.email;
    this.emailVerified = userData.emailVerified;
    // this.metadata =
    this.photoURL = userData.photoURL;
    // this.providerData =
    this.uid = userData.uid;

    this.toJSON = () => ({
      disabled: this.disabled,
      displayName: this.displayName,
      email: this.email,
      emailVerified: this.emailVerified,
      photoURL: this.photoURL,
      uid: this.uid,
    });
  }
};
