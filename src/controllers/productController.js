import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import productService from '../services/productService.js';

const createOne = (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const data = matchedData(req);

		res
			.status(201)
			.json({ status: 'OK', data: productService.createOne(data) });
	} catch (err) {
		next(
			createHttpError(
				err.array ? 400 : err.status,
				JSON.stringify(err.array ? err.array() : err.message)
			)
		);
	}
};

const getOne = (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const id = matchedData(req).id;

		res.json({ status: 'OK', data: productService.getOne(id) });
	} catch (err) {
		next(
			createHttpError(
				err.array ? 400 : err.status,
				JSON.stringify(err.array ? err.array() : err.message)
			)
		);
	}
};

const getAll = (req, res, next) => {
	try {
		res.json({ status: 'OK', data: productService.getAll() });
	} catch (err) {
		next(createHttpError(err.status, JSON.stringify(err.message)));
	}
};

const updateOne = (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { id, ...changes } = matchedData(req);

		res.json({
			status: 'OK',
			data: productService.updateOne(id, changes)
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

const deleteOne = (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const id = matchedData(req).id;

		res.json({ status: 'OK', data: productService.deleteOne(id) });
	} catch (err) {
		next(
			createHttpError(
				err.array ? 400 : err.status,
				JSON.stringify(err.array ? err.array() : err.message)
			)
		);
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
