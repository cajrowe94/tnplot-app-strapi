const config = require('../config');
const axios = require('axios');
const xlsx = require('node-xlsx');

const getFileById = async (fileId) => {
	const response = await axios.get(`${config.baseUrl}/api/upload/files/${fileId}`, config.apiAuth);
	return response.data;
}

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

const updatePlotData = async (parsedPlotData) => {
	const countyName = 0,
        plotNumber = 1,
        plotType = 2,
        plotProtocol = 3,
        plotSurveyDate = 4,
        plotCrewOne = 5,
        plotCrewTwo = 6,
        plotCrewThree = 7,
        plotCrewFour = 8;

    let response = {};

    if (parsedPlotData.length) {
    	parsedPlotData.forEach(item => {
    		
    	});
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

				// update the rows with the parsed data
				const updateResponse = await updatePlotData(parsedFile);

				ctx.body = parsedFile;
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