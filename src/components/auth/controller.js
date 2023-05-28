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
			...(validator.isMobilePhone(login, 'uk-UA')
				? { phoneNumber: login }
				: { email: login }),
			password
		};

		res.json({ token: await service.login(loginData) });
	} catch (err) {
		next(createError(err));
	}
};

const authenticate = async (req, res, next) => {
	try {
		req.user = await service.authenticate(req.get('Authorization'));

		next();
	} catch (err) {
		next(createError(err));
	}
};

const authenticateAndReturn = async (req, res, next) => {
	try {
		res.json(await service.authenticate(req.get('Authorization')));
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
		const restorationData = {
			...(validator.isMobilePhone(login, 'uk-UA')
				? { phoneNumber: login }
				: { email: login })
		};

		await service.restorePassword(restorationData);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

const verifyRestore = async (req, res, next) => {
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

		res.json(await service.verifyRestore(dataToVerify));
	} catch (err) {
		next(createError(err));
	}
};

export default {
	signup,
	login,
	authenticate,
	authenticateAndReturn,
	restorePassword,
	verifyRestore
};
