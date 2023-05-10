import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import bookService from '../services/bookService.js';

const createOne = (req, res, next) => {
	const error = validationResult(req)
		.formatWith(e => e.msg)
		.array({
			onlyFirstError: true
		})[0];

	if (error) {
		return next(createHttpError(400, error));
	}

	const data = matchedData(req);

	try {
		const book = bookService.createOne(data);

		res.status(201).json({ status: 'OK', data: book });
	} catch (err) {
		next(createHttpError(err.status, err.message));
	}
};

export default { createOne };
