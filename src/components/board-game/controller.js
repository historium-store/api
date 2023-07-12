import { matchedData, validationResult } from 'express-validator';
import { createError } from '../../utils.js';
import service from './service.js';

const createOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const boardGameData = matchedData(req);

		res.status(201).json(await service.createOne(boardGameData));
	} catch (err) {
		next(createError(err));
	}
};

const getOne = async (req, res, next) => {
	const { id } = req.params;

	try {
		res.json(await service.getOne(id));
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

export default {
	createOne,
	getOne,
	getAll
};
