import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import userService from '../services/userService.js';

const createOne = async (req, res, next) => {
	const errors = validationResult(req).array();

	if (errors.length) {
		return next(createHttpError(400, errors[0].msg));
	}

	const data = matchedData(req);

	try {
		const user = await userService.createOne(data);

		res.status(201).json({ status: 'OK', data: user });
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
		const user = userService.getOne(id);

		res.json({ status: 'OK', data: user });
	} catch (err) {
		next(createHttpError(err.status, err.message));
	}
};

const updateOne = async (req, res, next) => {
	const error = validationResult(req)
		.formatWith(e => e.msg)
		.array({
			onlyFirstError: true
		})[0];

	if (error) {
		return next(createHttpError(400, error));
	}

	const { id, ...changes } = matchedData(req);

	try {
		const user = await userService.updateOne(id, changes);

		res.json({ status: 'OK', data: user });
	} catch (err) {
		next(createHttpError(err.status, err.message));
	}
};

export default { createOne, getOne, updateOne };
