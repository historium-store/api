import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import config from '../config/main.js';

const secret = process.env.SECRET ?? config.SECRET;
const validateToken = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return next(createHttpError(401, 'Header not provided'));
	}

	const token = authHeader.split(' ')[1];
	if (!token) {
		return next(createHttpError(401, 'Token not provided'));
	}

	jwt.verify(token, secret, err => {
		if (!err) next();

		switch (err.name) {
			case 'TokenExpiredError':
				return next(createHttpError(401, 'Token has expired'));
			case 'JsonWebTokenError':
				return next(createHttpError(401, 'Invalid token'));
		}
	});
};

export default validateToken;
