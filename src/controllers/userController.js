import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import userService from '../services/userService.js';

const createOne = (req, res, next) => {
	const errors = validationResult(req).array();

	if (errors.length) {
		return next(createHttpError(400, errors[0].msg));
	}

	const { firstName, lastName, phoneNumber, email, password } = req.body;

	let user = null;
	try {
		user = userService.createOne({
			firstName,
			lastName,
			phoneNumber,
			email,
			password
		});
	} catch (err) {
		return next(createHttpError(err?.status || 500, err?.message || err));
	}

	res.status(201).json({ status: 'OK', data: user });
};

const getOne = (req, res, next) => {
	const { id } = req.params;

	let user = null;
	try {
		user = userService.getOne(id);
	} catch (err) {
		return next(createHttpError(err?.status || 500, err?.message || err));
	}

	res.json({ status: 'OK', data: user });
};

const updateOne = (req, res, next) => {
	const { id } = req.params;
	const { firstName, lastName, phoneNumber, email, password } = req.body;
	const dataToUpdate = {
		firstName,
		lastName,
		phoneNumber,
		email,
		password
	};
	Object.keys(dataToUpdate).forEach(
		k => dataToUpdate[k] ?? delete dataToUpdate[k]
	);

	let user = null;
	try {
		user = userService.updateOne(id, dataToUpdate);
	} catch (err) {
		return next(createHttpError(err?.status || 500, err?.message || err));
	}

	res.json({ status: 'OK', data: user });
};

export default { createOne, getOne, updateOne };
