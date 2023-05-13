import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import validator from 'validator';
import authService from '../services/authService.js';

export const signup = async (req, res, next) => {
	try {
		// если есть ошибки валидации - отформатировать их
		// убрав всё кроме сообщения и кинуть ошибку
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		// получение прошедших валидацию данных
		const data = matchedData(req);

		res
			.status(201)
			.json({ status: 'OK', data: await authService.signup(data) });
	} catch (err) {
		next(
			createHttpError(
				err.array ? 400 : err.status,
				JSON.stringify(err.array ? err.array() : err.message)
			)
		);
	}
};

export const login = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const data = matchedData(req);

		// приведение поля 'login' к 'email' или 'phoneNumber'
		// для корректной работы поиска
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
		next(
			createHttpError(
				err.array ? 400 : err.status,
				JSON.stringify(err.array ? err.array() : err.message)
			)
		);
	}
};

export const authenticate = async (req, res, next) => {
	try {
		req.user = await authService.authenticate(
			req.headers.authorization
		);

		next();
	} catch (err) {
		next(createHttpError(err.status, JSON.stringify(err.message)));
	}
};

export default { signup, login, authenticate };
