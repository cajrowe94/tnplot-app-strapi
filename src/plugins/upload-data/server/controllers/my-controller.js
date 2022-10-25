'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('upload-data')
      .service('myService')
      .getWelcomeMessage();
  },
});
