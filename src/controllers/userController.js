import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import userService from '../services/userService.js';

const createOne = async (req, res, next) => {
	const errors = validationResult(req).array();

	if (errors.length) {
		return next(createHttpError(400, errors[0].msg));
	}

	const data = matchedData(req);

	let user = null;
	try {
		user = await userService.createOne(data);
	} catch (err) {
		return next(
			createHttpError(err?.status || 500, err?.message || err)
		);
	}

	res.status(201).json({ status: 'OK', data: user });
};

const getOne = (req, res, next) => {
	const errors = validationResult(req).array();
	if (errors.length) {
		return next(createHttpError(400, errors[0].msg));
	}

	const id = matchedData(req).id;

	let user = null;
	try {
		user = userService.getOne(id);
	} catch (err) {
		return next(
			createHttpError(err?.status || 500, err?.message || err)
		);
	}

	res.json({ status: 'OK', data: user });
};

const updateOne = async (req, res, next) => {
	const errors = validationResult(req).array();
	if (errors.length) {
		return next(createHttpError(400, errors[0].msg));
	}

	const { id, ...changes } = matchedData(req);

	let user = null;
	try {
		user = await userService.updateOne(id, changes);
	} catch (err) {
		return next(
			createHttpError(err?.status || 500, err?.message || err)
		);
	}

	res.json({ status: 'OK', data: user });
};

export default { createOne, getOne, updateOne };
