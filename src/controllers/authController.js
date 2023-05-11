import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import validator from 'validator';
import authService from '../services/authService.js';

const signup = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();
	} catch (result) {
		return next(createHttpError(400, JSON.stringify(result.array())));
	}

	const data = matchedData(req);

	try {
		res
			.status(201)
			.json({ status: 'OK', data: await authService.signup(data) });
	} catch (err) {
		next(createHttpError(err.status, err.message));
	}
};

const login = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();
	} catch (result) {
		return next(createHttpError(400, JSON.stringify(result.array())));
	}

	const data = matchedData(req);
	const credentials = {
		...(validator.isMobilePhone(data.login, 'uk-UA')
			? { phoneNumber: data.login }
			: { email: data.login }),
		password: data.password
	};

	try {
		res.json({
			status: 'OK',
			data: await authService.login(credentials)
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

export default { signup, login, authenticate };
