'use strict';

let baseUrl = 'http://localhost:1337';

if (process.env.NODE_ENV == 'production') {
  baseUrl = '';
}

module.exports = {
  default: {},
  validator() {},
  apiAuth: {
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.STRAPI_ADMIN_JWT_DEV_TOKEN
    }
  },
  baseUrl: baseUrl
};
