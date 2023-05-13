import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import bookService from '../services/bookService.js';

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
				data: await bookService.createOne(data)
			});
	} catch (err) {
		next(
			createHttpError(
				err.array ? 400 : err.status,
				JSON.stringify(err.array ? err.array() : err.message)
			)
		);
	}
};

export default { createOne };
