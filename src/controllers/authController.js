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

	try {
		const token = await authService.createToken(credentials);

		res.json({ status: 'OK', data: { token } });
	} catch (err) {
		next(createHttpError(err.status, err.message));
	}
};

const authenticate = async (req, res, next) => {
	try {
		req.user = await authService.authenticate(
			req.headers.authorization
		);

		next();
	} catch (err) {
		next(createHttpError(err.status, err.message));
	}
};

export default { createToken, authenticate };
