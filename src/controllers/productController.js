import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import productService from '../services/productService.js';

const createOne = (req, res, next) => {
	const errors = validationResult(req).array();

	if (errors.length) {
		return next(createHttpError(400, errors[0].msg));
	}

	const data = matchedData(req);

	let product = null;
	try {
		product = productService.createOne(data);
	} catch (err) {
		return next(
			createHttpError(err?.status || 500, err?.message || err)
		);
	}

	res.json({ status: 'OK', data: product });
};

const getOne = (req, res, next) => {
	const errors = validationResult(req).array();

	if (errors.length) {
		return next(createHttpError(400, errors[0].msg));
	}

	const id = matchedData(req).id;

	let product = null;
	try {
		product = productService.getOne(id);
	} catch (err) {
		return next(
			createHttpError(err?.status || 500, err?.message || err)
		);
	}

	res.json({ status: 'OK', data: product });
};

const getAll = (req, res, next) => {
	try {
		res.json({ status: 'OK', data: productService.getAll() });
	} catch (err) {
		next(createHttpError(err?.status || 500, err?.message || err));
	}
};

const updateOne = (req, res, next) => {
	const errors = validationResult(req).array();

	if (errors.length) {
		return next(createHttpError(400, errors[0].msg));
	}

	const { id, ...changes } = matchedData(req);

	let product = null;
	try {
		product = productService.updateOne(id, changes);
	} catch (err) {
		return next(
			createHttpError(err?.status || 500, err?.message || err)
		);
	}

	res.json({ status: 'OK', data: product });
};

const deleteOne = (req, res, next) => {
	const errors = validationResult(req).array();

	if (errors.length) {
		return next(createHttpError(400, errors[0].msg));
	}

	const id = matchedData(req).id;

	let product = null;
	try {
		product = productService.deleteOne(id);
	} catch (err) {
		return next(
			createHttpError(err?.status || 500, err?.message || err)
		);
	}

	res.json({ status: 'OK', data: product });
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
