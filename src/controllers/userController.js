import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import userService from '../services/userService.js';

const createOne = (req, res, next) => {
	const errors = validationResult(req).array();

	if (errors.length) {
		return next(createHttpError(400, errors[0].msg));
	}

	const data = matchedData(req);

	let user = null;
	try {
		user = userService.createOne({
			firstName: data.firstName,
			lastName: data.lastName,
			phoneNumber: data.phoneNumber,
			email: data.email,
			password: data.password
		});
	} catch (err) {
		return next(createHttpError(err?.status || 500, err?.message || err));
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
		return next(createHttpError(err?.status || 500, err?.message || err));
	}

	res.json({ status: 'OK', data: user });
};

const updateOne = (req, res, next) => {
	const errors = validationResult(req).array();
	if (errors.length) {
		return next(createHttpError(400, errors[0].msg));
	}

	const { id, ...dataToUpdate } = matchedData(req);

	let user = null;
	try {
		user = userService.updateOne(id, dataToUpdate);
	} catch (err) {
		return next(createHttpError(err?.status || 500, err?.message || err));
	}

	res.json({ status: 'OK', data: user });
};

export default { createOne, getOne, updateOne };
