import { pbkdf2, randomUUID } from 'crypto';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import multer, { diskStorage } from 'multer';
import { promisify } from 'util';
import validator from 'validator';

export const createError = err => {
	return createHttpError(
		err.array ? 400 : err.status ?? 500,
		err.array ? JSON.stringify(err.array()) : err.message ?? err
	);
};

export const upload = multer(
	diskStorage({
		destination: 'uploads/',
		filename: (req, file, cb) => {
			const extension = file.mimetype.split('/')[1];
			cb(null, `${randomUUID()}.${extension}`);
		}
	})
);

export const hashPassword = promisify(pbkdf2);

export const verifyJWT = promisify(jwt.verify);

export const isArrayOfMongoIds = value => {
	const isArray = Array.isArray(value);

	if (!isArray) {
		throw 'Book series book(s) must be an array';
	}

	if (value.every(id => validator.isMongoId(id))) {
		return true;
	}

	throw 'Invalid book id format';
};
