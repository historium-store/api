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
				err.array ? 400 : err.status ?? 500,
				err.array ? JSON.stringify(err.array()) : err.message ?? err
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

		res.json({ status: 'OK', data: await bookService.getOne(id) });
	} catch (err) {
		next(
			createHttpError(
				err.array ? 400 : err.status ?? 500,
				err.array ? JSON.stringify(err.array()) : err.message ?? err
			)
		);
	}
};

const getAll = async (req, res, next) => {
	try {
		res.json({ status: 'OK', data: await bookService.getAll() });
	} catch (err) {
		next(createHttpError(err.status ?? 500, err.message ?? err));
	}
};

const updateOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { id, ...changes } = matchedData(req);

		res.json({
			status: 'OK',
			data: await bookService.updateOne(id, changes)
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

const deleteOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { id } = matchedData(req);

		res.json({ status: 'OK', data: await bookService.deleteOne(id) });
	} catch (err) {
		next(
			createHttpError(
				err.array ? 400 : err.status ?? 500,
				err.array ? JSON.stringify(err.array()) : err.message ?? err
			)
		);
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
