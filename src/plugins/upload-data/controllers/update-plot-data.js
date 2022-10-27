'use strict';

/**
 * A set of functions called "actions" for `update-plot-data`
 */

module.exports = {
  updatePlotData: async (ctx, next) => {
    try {
      ctx.body = 'ok';
    } catch (err) {
      ctx.body = err;
    }
  }
};
