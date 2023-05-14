import createHttpError from 'http-errors';

export const checkRole = roles => (req, res, next) => {
	if (roles.includes(req.user.role)) {
		return next();
	}

	next(createHttpError(403, JSON.stringify('Forbidden')));
};
