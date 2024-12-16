'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/regle-zod.min.cjs');
} else {
  module.exports = require('./dist/regle-zod.cjs');
}
