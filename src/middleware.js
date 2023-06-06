import { query } from 'express-validator';
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

export const validateQueryParams = [
	query('limit')
		.default(0)
		.isInt({ min: 0 })
		.withMessage(
			"Query parameter 'limit' must be a positive integer"
		),
	query('offset')
		.default(0)
		.isInt({ min: 0 })
		.withMessage(
			"Query parameter 'offset' must be a positive integer"
		),
	query('withProducts')
		.optional()
		.if(query('withProducts').exists())
		.customSanitizer(() => true),
	query('orderBy')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Query parameter 'orderBy' must have a value"),
	query('order')
		.if(query('orderBy').exists())
		.default('ascending')
		.isIn(['ascending', 'descending', 'asc', 'desc'])
		.withMessage('Invalid order direction')
];
