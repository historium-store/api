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

export const isEmailOrPhoneNumber = value => {
	const isPhoneNumber = validator.isMobilePhone(value, 'uk-UA');
	const isEmail = validator.isEmail(value);

	if (isPhoneNumber || isEmail) {
		return true;
	}

	throw 'Invalid user phone number or email';
};

export const isArrayOfMongoIds = (entity, field) => value => {
	const isArray = Array.isArray(value);

	if (!isArray) {
		throw `${entity} ${field} must be an array`;
	}

	const invalidIdIndex = value.findIndex(
		id => !validator.isMongoId(id)
	);
	if (invalidIdIndex > -1) {
		throw `Invalid ${field} id at index ${invalidIdIndex}`;
	}

	return true;
};

export const isArrayOfIsbns = value => {
	if (!Array.isArray(value)) {
		throw 'Book isbns must be an array';
	}

	const invalidIsbnIndex = value.findIndex(i => !validator.isISBN(i));
	if (invalidIsbnIndex > -1) {
		throw `Invalid isbn at index ${invalidIsbnIndex}`;
	}

	return true;
};
