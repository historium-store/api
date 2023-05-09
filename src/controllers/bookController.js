import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import bookService from '../services/bookService.js';

const createOne = (req, res, next) => {
	const errors = validationResult(req).array();

	if (errors.length) {
		return next(createHttpError(400, errors[0].msg));
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
