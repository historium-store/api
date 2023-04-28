import createHttpError from 'http-errors';

export default (req, res, next) => {
	const { email, password } = req.body;

	if (!email) {
		return next(createHttpError(400, 'Email not provided'));
	}

	if (!password) {
		return next(createHttpError(400, 'Password not provided'));
	}

	next();
};
