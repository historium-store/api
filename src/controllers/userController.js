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

export default { createOne };
