import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import productService from '../services/productService.js';

const createOne = (req, res, next) => {
	const errors = validationResult(req).array();

	if (errors.length) {
		return next(createHttpError(400, errors[0].msg));
	}

	const data = matchedData(req);

	try {
		const product = productService.createOne(data);

		res.status(201).json({ status: 'OK', data: product });
	} catch (err) {
		next(createHttpError(err.status, err.message));
	}
};

const getOne = (req, res, next) => {
	const errors = validationResult(req).array();

	if (errors.length) {
		return next(createHttpError(400, errors[0].msg));
	}

	const id = matchedData(req).id;

	try {
		const product = productService.getOne(id);

		res.json({ status: 'OK', data: product });
	} catch (err) {
		next(createHttpError(err.status, err.message));
	}
};

const getAll = (req, res, next) => {
	try {
		res.json({ status: 'OK', data: productService.getAll() });
	} catch (err) {
		next(createHttpError(err.status, err.message));
	}
};

const updateOne = (req, res, next) => {
	const errors = validationResult(req).array();

	if (errors.length) {
		return next(createHttpError(400, errors[0].msg));
	}

	const { id, ...changes } = matchedData(req);

	try {
		const product = productService.updateOne(id, changes);

		res.json({ status: 'OK', data: product });
	} catch (err) {
		next(createHttpError(err.status, err.message));
	}
};

const deleteOne = (req, res, next) => {
	const errors = validationResult(req).array();

	if (errors.length) {
		return next(createHttpError(400, errors[0].msg));
	}

	const id = matchedData(req).id;

	try {
		const product = productService.deleteOne(id);

		res.json({ status: 'OK', data: product });
	} catch (err) {
		next(createHttpError(err.status, err.message));
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
