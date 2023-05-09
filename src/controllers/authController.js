import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import authService from '../services/authService.js';

const createToken = async (req, res, next) => {
	const error = validationResult(req)
		.formatWith(e => e.msg)
		.array({
			onlyFirstError: true
		})[0];

	if (error) {
		return next(createHttpError(400, error));
	}

	const data = matchedData(req);
	const credentials = {
		...(/^(\+380\d{9})$/.test(data.login)
			? { phoneNumber: data.login }
			: { email: data.login }),
		password: data.password
	};

	try {
		res.json({
			status: 'OK',
			data: { token: await authService.createToken(credentials) }
		});
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
