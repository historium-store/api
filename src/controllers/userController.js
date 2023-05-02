import createHttpError from 'http-errors';
import userService from '../services/userService.js';

const createOne = (req, res, next) => {
	const { email, password } = req.body;

	let user = null;
	try {
		user = userService.createOne({ email, password });
	} catch (err) {
		return next(createHttpError(err?.status || 500, err?.message || err));
	}

	res.status(201).json({ status: 'OK', data: user });
};

export default { createOne };
