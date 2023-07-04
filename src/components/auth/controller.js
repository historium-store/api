import { matchedData, validationResult } from 'express-validator';
import validator from 'validator';
import { createError } from '../../utils.js';
import service from './service.js';

const signup = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const userData = matchedData(req);

		res.status(201).json(await service.signup(userData));
	} catch (err) {
		next(createError(err));
	}
};

const login = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { login, password } = matchedData(req);

		const loginData = {
			...(validator.isEmail(login)
				? { email: login }
				: { phoneNumber: login }),
			password
		};

		res.json(await service.login(loginData));
	} catch (err) {
		next(createError(err));
	}
};

export const authenticate = async (req, res, next) => {
	try {
		req.user = await service.authenticate(req.get('Authorization'));

		next();
	} catch (err) {
		next(createError(err));
	}
};

const restorePassword = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { login } = matchedData(req);

		const loginData = {
			...(validator.isEmail(login)
				? { email: login }
				: { phoneNumber: login })
		};

		await service.restorePassword(loginData);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

export default {
	signup,
	login,
	authenticate,
	restorePassword
};
