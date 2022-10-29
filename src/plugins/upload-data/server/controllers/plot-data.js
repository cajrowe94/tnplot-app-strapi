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
		const workSheetsFromFile = xlsx.parse(`/opt/app/public/${fileObject.url}`);
		return workSheetsFromFile;
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
				const file = await getFileById(requestBody.fileId);
				const parsedFile = parseFile(file);

				ctx.body = { 'message': parsedFile }
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