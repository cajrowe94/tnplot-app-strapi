const config = require('../config');
const axios = require('axios');
const xlsx = require('node-xlsx');

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
		const parsedData = xlsx.parse(`/opt/app/public/${fileObject.url}`);

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
			let plot = await getPlot(item);
			let county = await getCounty(item);

			// missing county row
			if (!county) {
				response.push({ error: `Missing county: ${item[0]}, for plot number: ${item[1]}` });
			} else if (plot && county) {

			} else {
				response.push({ error: `Something went wrong with row with plot number: ${item[1]}` });
			}

			response = response.concat(...plot);
    	}

    	return response;
    }
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
		const county = await strapi.entityService.findMany('api::county.county', {
			fields: [
				'countyName',
			],
			filters: {
				countyName: item[countyName],
			}
		});
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
			try {
				const plot = await strapi.entityService.findMany('api::plot.plot', {
					fields: [
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
						plotNumber: parseInt(item[plotNumber]),
					},
					populate: {
						county: {
							filters: {
								countyName: {
									$eq: item[countyName]
								}
							}
						}
					},
	    		});

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

			let requestBody = ctx.request.body;

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