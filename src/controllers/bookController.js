import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import bookService from '../services/bookService.js';

const createOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const data = matchedData(req);

		res.status(201).json({
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

const getOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { id } = matchedData(req);

		res
			.status(200)
			.json({ status: 'OK', data: await bookService.getOne(id) });
	} catch (err) {
		next(
			createHttpError(
				err.array ? 400 : err.status,
				JSON.stringify(err.array ? err.array() : err.message)
			)
		);
	}
};

const getAll = async (req, res, next) => {
	try {
		res
			.status(200)
			.json({ status: 'OK', data: await bookService.getAll() });
	} catch (err) {
		next(createHttpError(err.status, JSON.stringify(err.message)));
	}
};

export default { createOne, getOne, getAll };
