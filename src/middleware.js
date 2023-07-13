import apicache from 'apicache';
import { rateLimit } from 'express-rate-limit';
import { param, query } from 'express-validator';
import createHttpError from 'http-errors';
import { createError } from './utils.js';

export const verifyApiKey = (req, res, next) => {
	const apiKey = req.get('API-Key');

	if (!apiKey) {
		next(createHttpError(403, 'API key not provided'));
	} else if (!(apiKey === process.env.API_KEY)) {
		next(createHttpError(403, 'Invalid API key'));
	} else {
		next();
	}
};

export const errorHandler = (err, req, res, next) => {
	let message;

	try {
		message = JSON.parse(err.message);
	} catch {
		if (!err.status || err.status == 500) {
			console.log(err.message ?? err);
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

export const validateId = [
	param('id')
		.isMongoId()
		.withMessage("Parameter 'id' must be a valid mongo id")
];

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
		.withMessage('Invalid order direction'),
	query('preview')
		.optional()
		.customSanitizer(() => true),
	query('bookType')
		.optional()
		.customSanitizer(value => value.split(';')),
	query('publisher')
		.optional()
		.customSanitizer(value => value.split(';')),
	query('language')
		.optional()
		.customSanitizer(value => value.split(';')),
	query('author')
		.optional()
		.customSanitizer(value => value.split(';')),
	query('price')
		.optional()
		.customSanitizer(value => value.split('-')),
	query('country')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Query parameter 'country' must have a value"),
	query('withDeleted')
		.optional()
		.customSanitizer(() => true),
	query('type').optional(),
	query('status')
		.optional()
		.isIn(['active', 'completed', 'canceled'])
		.withMessage('Invalid order status')
];

export const cache = apicache.options({
	headers: {
		'Cache-Control': 'no-cache'
	},
	enabled: process.env.NODE_ENV === 'production'
}).middleware;

export const rateLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes in milliseconds
	max: 200,
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res, next) => {
		next(createError({ status: 429 }));
	}
});
