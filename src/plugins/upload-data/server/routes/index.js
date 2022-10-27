module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: 'myController.index',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/update-plot-data',
    handler: 'updatePlotDataController.updatePlotData'
  }
];
