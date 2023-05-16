import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import publisherService from '../services/publisherService.js';

const createOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const data = matchedData(req);

		res
			.status(201)
			.json({
				status: 'OK',
				data: await publisherService.createOne(data)
			});
	} catch (err) {
		next(
			createHttpError(
				err.array ? 400 : err.status ?? 500,
				err.array ? JSON.stringify(err.array()) : err.message ?? err
			)
		);
	}
};

export default { createOne };
