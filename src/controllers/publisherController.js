import { matchedData, validationResult } from 'express-validator';
import publisherService from '../services/publisherService.js';
import createError from '../utils/create-error.js';

const createOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const data = matchedData(req);

		res.status(201).json({
			publisher: await publisherService.createOne(data)
		});
	} catch (err) {
		next(createError(err));
	}
};

const getOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { id } = matchedData(req);

		res.json({
			publisher: await publisherService.getOne(id)
		});
	} catch (err) {
		next(createError(err));
	}
};

const getAll = async (req, res, next) => {
	try {
		res.json({
			publishers: await publisherService.getAll()
		});
	} catch (err) {
		next(createError(err));
	}
};

const updateOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { id, ...changes } = matchedData(req);

		res.json({
			publisher: await publisherService.updateOne(id, changes)
		});
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

		res.json({
			publisher: await publisherService.deleteOne(id)
		});
	} catch (err) {
		next(createError(err));
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
