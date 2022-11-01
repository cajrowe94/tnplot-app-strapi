const config = require('../config');
const axios = require('axios');
const xlsx = require('node-xlsx');

/**
 * Get media file
 */

const getFileById = async (fileId) => {
	const response = await axios.get(`${config.baseUrl}/api/upload/files/${fileId}`, config.apiAuth);
	return response.data;
}

/**
 * Parse xlsx file into usable json
 */

const parseFile = (fileObject) => {
	if (
		fileObject &&
		fileObject.url
	) {
		// const parsedData = xlsx.parse(`/opt/app/public/${fileObject.url}`, { raw: false }); // docker
		const parsedData = xlsx.parse(`public${fileObject.url}`, { raw: false }); // local

		if (
			parsedData &&
			parsedData.length
		) {
			return parsedData[0].data;
		}

		return { data: [] }
	}
}

/**
 * Update plot data
 * Will also update any county rows with new plots
 */

const handleUpdates = async (parsedPlotData) => {
    let response = [];

    if (parsedPlotData.length) {
		for (const item of parsedPlotData) {
			let county = await getCounty(item);
			let plot = await getPlot(item);

			// missing county row
			if (!county || !county.length) {
				response.push({ error: `Missing county: ${item[0]}, for plot number: ${item[1]}` });
			} else if (plot.length && county.length) {
				// we have both a plot and county
				let updatePlotResponse = await updatePlot(plot, county, item);
				let updateCountyResponse = await updateCounty(plot, county, item);

				response.push({
					updates: {
						plot: updatePlotResponse,
						county: updateCountyResponse
					}
				});
			} else {
				response.push({ error: `Something went wrong with plot number: ${item[1]}, for county: ${item[0]}` });
			}
    	}

    	return response;
    }
}

/**
 * Handle county update
 */

const updateCounty = async (plot, county, item) => {
	let plotData = plot[0];
	let countyData = county[0];

	let response = {
		messages: [],
		countyData: null
	}

	let updateData = { data: {}, 'populate': '*' }

	if (!countyData.plots) {
		updateData.data.plots = [];
	} else {
		updateData.data.plots = countyData.plots;
	}

	let addToCounty = true;

	for (const plotRelation of updateData.data.plots) {
		if (plotRelation.id === plotData.id) {
			addToCounty = false;
		}
	}

	if (addToCounty) {
		updateData.data.plots.push({ id: plotData.id });
		const updatedCounty = await strapi.entityService.update('api::county.county', countyData.id, updateData);

		response.messages.push(`Added plot ${plotData.plotId} to ${countyData.countyName} county`);
		response.countyData = updatedCounty;
	} else {
		response.messages.push(`Plot ${plotData.plotId} already attached to ${countyData.countyName} county`);
	}

	return response;
}

/**
 * Handle plot updates
 */

const updatePlot = async (plot, county, item) => {
	const countyName = 0,
        plotNumber = 1,
        plotType = 2,
        plotProtocol = 3,
        plotSurveyDate = 4,
        plotCrewOne = 5,
        plotCrewTwo = 6,
        plotCrewThree = 7,
        plotCrewFour = 8;

	let plotData = plot[0];
	let countyData = county[0];

	let updateData = {
		data: {}
	}

	let response = {
		messages: [],
		plotData: null
	}

	// plot has no county
	if (
		!plotData.county &&
		countyData.id
	) {
		updateData.data.county = { id: countyData.id };
		response.messages.push(`Updated plot county field with: ${countyData.countyName}`);
	}

	// check for any updated fields
	// love me some if statements :/

	// plot number
	if (parseInt(plotData.plotNumber) != parseInt(item[plotNumber])) {
		updateData.data.plotNumber = parseInt(item[plotNumber]);
		response.messages.push(`Changed plot number from ${plotData.plotNumber} to ${item[plotNumber]}`);
	}

	// plot type
	if (plotData.plotType != item[plotType]) {
		updateData.data.plotType = item[plotType];
		response.messages.push(`Changed plot type from ${plotData.plotType} to ${item[plotType]}`);
	}

	// plot protocol
	if (plotData.plotProtocol != item[plotProtocol]) {
		updateData.data.plotProtocol = item[plotProtocol];
		response.messages.push(`Changed plot protocol from ${plotData.plotProtocol} to ${item[plotProtocol]}`);
	}

	// plot survey date
	if (plotData.plotSurveyDate != item[plotSurveyDate]) {
		updateData.data.plotSurveyDate = item[plotSurveyDate];
		response.messages.push(`Changed plot survey date from ${plotData.plotSurveyDate} to ${item[plotSurveyDate]}`);
	}

	// plot crew one
	if (plotData.plotCrewOne != item[plotCrewOne]) {
		updateData.data.plotCrewOne = item[plotCrewOne];
		response.messages.push(`Changed plot crew one from ${plotData.plotCrewOne} to ${item[plotCrewOne]}`);
	}

	// plot crew two
	if (plotData.plotCrewTwo != item[plotCrewTwo]) {
		updateData.data.plotCrewTwo = item[plotCrewTwo];
		response.messages.push(`Changed plot crew two from ${plotData.plotCrewTwo} to ${item[plotCrewTwo]}`);
	}

	// plot crew three
	if (plotData.plotCrewThree != item[plotCrewThree]) {
		updateData.data.plotCrewThree = item[plotCrewThree];
		response.messages.push(`Changed plot crew three from ${plotData.plotCrewThree} to ${item[plotCrewThree]}`);
	}

	// plot crew four
	if (plotData.plotCrewFour != item[plotCrewFour]) {
		updateData.data.plotCrewFour = item[plotCrewFour];
		response.messages.push(`Changed plot crew four from ${plotData.plotCrewFour} to ${item[plotCrewFour]}`);
	}

	// run an update if there are any changes
	if (Object.keys(updateData.data).length > 0) {
		const updatedPlot = await strapi.entityService.update('api::plot.plot', plotData.id, updateData);
		response.plotData = updatedPlot;
	} else {
		response.messages.push(`No changes for ${plotData.plotId}`);
	}

	return response;
}

/**
 * Query for county row
 */

const getCounty = async (item) => {
	const countyName = 0;

	if (
		item &&
		item[countyName]
	) {
		try {
			const county = await strapi.entityService.findMany('api::county.county', {
				fields: [
					'countyName',
				],
				filters: {
					countyName: item[countyName],
				},
				'populate': '*'
			});

			// if (
			// 	!county ||
			// 	!county.length
			// ) {
			// 	const createdCounty = await strapi.entityService.create('api::county.county', {
			// 		data: {
			// 			countyName: item[countyName],
			// 			publishedAt: new Date().toISOString()
			// 		}
			// 	});

			// 	return createdCounty;
			// }

			return county;
		} catch(err) {
			return [{ error: err.message }];
		}
	} else {
		return null;
	}
}

/**
 * Query for plot row
 */

const getPlot = async (item) => {
	const countyName = 0,
        plotNumber = 1,
        plotType = 2,
        plotProtocol = 3,
        plotSurveyDate = 4,
        plotCrewOne = 5,
        plotCrewTwo = 6,
        plotCrewThree = 7,
        plotCrewFour = 8;

    if (item) {
    	let parsedPlotNumber = parseInt(item[plotNumber]);
		let plotCountyName = item[countyName];

		if (
			parsedPlotNumber &&
			plotCountyName
		) {
			let plotId = plotCountyName.toLowerCase() + '-plot-' + parsedPlotNumber;

			try {
				const plot = await strapi.entityService.findMany('api::plot.plot', {
					fields: [
						'plotId',
						'plotNumber',
						'plotType',
						'plotProtocol',
						'plotSurveyDate',
						'plotCrewOne',
						'plotCrewTwo',
						'plotCrewThree',
						'plotCrewFour',
					],
					filters: {
						plotId: plotId,
					},
					populate: '*',
	    		});

	    		if (
	    			!plot ||
	    			!plot.length
    			) {
	    			// create a new plot
					const createdPlot = await strapi.entityService.create('api::plot.plot', {
						data: {
							plotId: plotId,
							plotNumber: parsedPlotNumber,
							plotType: item[plotType],
							plotProtocol: item[plotProtocol],
							plotSurveyDate: item[plotSurveyDate],
							plotCrewOne: item[plotCrewOne],
							plotCrewTwo: item[plotCrewTwo],
							plotCrewThree: item[plotCrewThree],
							plotCrewFour: item[plotCrewFour],
							publishedAt: new Date().toISOString()
						},
					});

					return createdPlot;
    			}

	    		return plot;
			} catch(err) {
				return [{ error: err.message }];
			}
		} else {
			return [{ error: `Invalid row with plot number: ${item[plotNumber]}, county name: ${item[countyName]}` }];
		}
    } else {
    	return null;
    }
}

module.exports = {
	updateData: async (ctx) => {
		try {

			let requestBody = JSON.parse(ctx.request.body);

			if (
				requestBody &&
				requestBody.fileId
			) {
				// get the uploaded file
				const file = await getFileById(requestBody.fileId);

				// parse out the raw data
				const parsedFile = parseFile(file);

				// initialize updates
				const updateResponse = await handleUpdates(parsedFile);

				ctx.body = updateResponse;
			} else {
				ctx.body = {
					'message': 'fileId required'
				}
			}

		} catch(err) {
			console.log(err);
			ctx.body = { 'message': err.message };
		}
	}
};