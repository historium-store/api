import createHttpError from 'http-errors';

export const checkRole = role => (req, res, next) => {
	if (req.user.role === role) {
		return next();
	}

	next(createHttpError(403, JSON.stringify('Forbidden')));
};
