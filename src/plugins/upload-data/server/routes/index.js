module.exports = [
	{
		method: 'POST',
		path: '/update-plot-data',
		handler: 'plotData.updateData',
		config: {
			auth: false,
			policies: []
		}
	}
];