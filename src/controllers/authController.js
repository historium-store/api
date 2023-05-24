import { matchedData, validationResult } from 'express-validator';
import validator from 'validator';
import authService from '../services/authService.js';
import createError from '../utils/create-error.js';

export const signup = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const userData = matchedData(req);

		res.status(201).json({
			user: await authService.signup(userData)
		});
	} catch (err) {
		next(createError(err));
	}
};

export const login = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { login, password } = matchedData(req);

		const loginData = {
			...(validator.isMobilePhone(login, 'uk-UA')
				? { phoneNumber: login }
				: { email: login }),
			password
		};

		res.json({ token: await authService.login(loginData) });
	} catch (err) {
		next(createError(err));
	}
};

export const authenticate = async (req, res, next) => {
	try {
		req.user = await authService.authenticate(
			req.get('Authorization')
		);

		next();
	} catch (err) {
		next(createError(err));
	}
};

export const restorePassword = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { login } = matchedData(req);
		const restorationData = {
			...(validator.isMobilePhone(login, 'uk-UA')
				? { phoneNumber: login }
				: { email: login })
		};

		await authService.restorePassword(restorationData);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

export const verifyRestorationToken = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { login, restorationToken } = matchedData(req);

		const dataToVerify = {
			...(validator.isMobilePhone(login, 'uk-UA')
				? { phoneNumber: login }
				: { email: login }),
			restorationToken
		};

		res.json({
			id: await authService.verifyRestorationToken(dataToVerify)
		});
	} catch (err) {
		next(createError(err));
	}
};

export default {
	signup,
	login,
	authenticate,
	restorePassword,
	verifyRestorationToken
};
