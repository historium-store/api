import createHttpError from 'http-errors';

const checkRole = role => (req, res, next) => {
	if (req.user.role === role) {
		return next();
	}

	next(createHttpError(403));
};

export default checkRole;
