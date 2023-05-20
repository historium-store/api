import { matchedData, validationResult } from 'express-validator';
import validator from 'validator';
import authService from '../services/authService.js';
import createError from '../utils/createError.js';

export const signup = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const data = matchedData(req);

		res
			.status(201)
			.json({ status: 'OK', data: await authService.signup(data) });
	} catch (err) {
		next(createError(err));
	}
};

export const login = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const data = matchedData(req);

		const credentials = {
			...(validator.isMobilePhone(data.login, 'uk-UA')
				? { phoneNumber: data.login }
				: { email: data.login }),
			password: data.password
		};

		res.json({
			status: 'OK',
			data: { token: await authService.login(credentials) }
		});
	} catch (err) {
		next(createError(err));
	}
};

export const authenticate = async (req, res, next) => {
	try {
		req.user = await authService.authenticate(
			req.headers.authorization
		);

		next();
	} catch (err) {
		next(createError(err));
	}
};

export default { signup, login, authenticate };
