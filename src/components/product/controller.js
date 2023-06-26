import { matchedData, validationResult } from 'express-validator';
import { createError } from '../../utils.js';
import service from './service.js';

const createOne = async (req, res, next) => {
	const { id: seller } = req.user;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const productData = matchedData(req);

		productData.seller = seller;

		res.status(201).json(await service.createOne(productData));
	} catch (err) {
		next(createError(err));
	}
};

const getOne = async (req, res, next) => {
	const { id } = req.params;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { preview } = matchedData(req);

		res.json(await service.getOne(id, preview));
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
	const { id: seller } = req.user;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { id, ...changes } = matchedData(req);

		res.json(await service.updateOne(id, changes, seller));
	} catch (err) {
		next(createError(err));
	}
};

const deleteOne = async (req, res, next) => {
	const { id } = req.params;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		await service.deleteOne(id);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

export default {
	createOne,
	getOne,
	getAll,
	updateOne,
	deleteOne
};
