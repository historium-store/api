import { matchedData, validationResult } from 'express-validator';
import { createError } from '../../utils.js';
import service from './service.js';

const createOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const sectionData = matchedData(req);

		res.status(201).json(await service.createOne(sectionData));
	} catch (err) {
		next(createError(err));
	}
};

const getOne = async (req, res, next) => {
	const { id } = req.params;

	try {
		const { withProducts } = matchedData(req);

		res.json(await service.getOne(id, withProducts));
	} catch (err) {
		next(createError(err));
	}
};

const getAll = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const queryParams = matchedData(req);

		res.json(await service.getAll(queryParams));
	} catch (err) {
		next(createError(err));
	}
};

const updateOne = async (req, res, next) => {
	const { id } = req.params;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { ...changes } = matchedData(req);

		res.json(await service.updateOne(id, changes));
	} catch (err) {
		next(createError(err));
	}
};

const deleteOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { id } = matchedData(req);

		await service.deleteOne(id);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

const getProducts = async (req, res, next) => {
	const { id } = req.params;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const queryParams = matchedData(req);

		res.json(await service.getProducts(id, queryParams));
	} catch (err) {
		next(createError(err));
	}
};

export default {
	createOne,
	getOne,
	getAll,
	updateOne,
	deleteOne,
	getProducts
};
