'use strict';

/*
*
*  Config structure:
*  - order: object
*    - by: 'key' | 'child' | 'value'
*    - path: string (only if order.by === 'child') | void
*  - filter: object | void
*    - min: any | null
*    - max: any | null
*    - limit: object | null
*      - by: 'toFirst' | 'toLast'
*      - amount: integer
*
*/
module.exports = (ref, config, callback, finish) => {
  const { order, filter } = config;

  if (data === null || typeof data !== 'object') {
    finish();
    return;
  }

  if (order.by === 'key') {
    // const
  } else {

  }
};
