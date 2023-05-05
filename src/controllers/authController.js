import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import authService from '../services/authService.js';

const createToken = async (req, res, next) => {
	const errors = validationResult(req).array();

	if (errors.length == 2) {
		return next(createHttpError(400, 'Invalid login format'));
	}

	const { login, password } = req.body;
	const credentials = { password };

	if (errors[0].msg === 'Invalid email format') {
		credentials.phoneNumber = login;
	} else {
		credentials.email = login;
	}

	let token = null;
	try {
		token = await authService.createToken(credentials);
	} catch (err) {
		return next(createHttpError(err?.status || 500, err?.message || err));
	}

	res.json({
		status: 'OK',
		data: { token }
	});
};

const authenticate = async (req, res, next) => {
	let user = null;
	try {
		user = await authService.authenticate(req.headers.authorization);
	} catch (err) {
		return next(createHttpError(err?.status || 500, err?.message || err));
	}

	req.user = user;
	next();
};

export default { createToken, authenticate };
