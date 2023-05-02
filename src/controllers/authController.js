import createHttpError from 'http-errors';
import authService from '../services/authService.js';

const createNewToken = (req, res, next) => {
	const { email, password } = req.body;

	let token = null;
	try {
		token = authService.createNewToken({
			email,
			password
		});
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

export default { createNewToken, authenticate };
