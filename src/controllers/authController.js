import createHttpError from 'http-errors';
import authService from '../services/authService.js';

const createToken = (req, res, next) => {
	const { phoneNumber, email, password } = req.body;
	const credentials = { password };

	if (phoneNumber) {
		credentials.phoneNumber = phoneNumber;
	} else {
		credentials.email = email;
	}

	let token = null;
	try {
		token = authService.createToken(credentials);
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
