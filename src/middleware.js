import createHttpError from 'http-errors';

export const errorHandler = (err, req, res, next) => {
	let message;

	try {
		message = JSON.parse(err.message);
	} catch {
		if (!err.status || err.status == 500) {
			console.log(err);
			message = 'Internal server error';
		} else {
			message = err.message ?? err;
		}
	}

	res.status(err.status ?? 500).json({
		message
	});
};

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
