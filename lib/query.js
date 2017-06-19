'use strict';

// Query and Reference have cyclic dependency on each other.
// To avoid NodeJS issues we place them on a single file but export them
// independently
module.exports = require('./database-accesors').Query;
