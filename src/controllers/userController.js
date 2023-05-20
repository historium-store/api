import { matchedData, validationResult } from 'express-validator';
import userService from '../services/userService.js';
import createError from '../utils/createError.js';

const createOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const data = matchedData(req);

		res.status(201).json({
			status: 'OK',
			data: await userService.createOne(data)
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

		res.json({ status: 'OK', data: await userService.getOne(id) });
	} catch (err) {
		next(createError(err));
	}
};

const getAll = async (req, res, next) => {
	try {
		res.json({ status: 'OK', data: await userService.getAll() });
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
			status: 'OK',
			data: await userService.updateOne(id, changes)
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

		const id = matchedData(req).id;

		res.json({
			status: 'OK',
			data: await userService.deleteOne(id)
		});
	} catch (err) {
		next(createError(err));
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
