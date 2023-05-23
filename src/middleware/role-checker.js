import createHttpError from 'http-errors';

export const checkRole = roles => (req, res, next) => {
	if (roles.includes(req.user.role)) {
		return next();
	}

	next(createHttpError(403, 'No permission to use this endpoint'));
};

export const checkSameIdOrRole = roles => (req, res, next) => {
	if (
		req.user.id === req.params.id ||
		roles.includes(req.user.role)
	) {
		return next();
	}

	next(createHttpError(403, 'No permission to use this endpoint'));
};
