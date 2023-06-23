import { S3Client } from '@aws-sdk/client-s3';
import { Vonage } from '@vonage/server-sdk';
import { pbkdf2, randomUUID } from 'crypto';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import multerS3 from 'multer-s3';
import nodemailer from 'nodemailer';
import { extname } from 'path';
import { transliterate } from 'transliteration';
import { promisify } from 'util';
import validator from 'validator';

export const JWT_OPTIONS = {
	expiresIn: process.env.JWT_EXPIRATION,
	noTimestamp: true
};

const s3 = new S3Client({
	region: process.env.S3_BUCKET_REGION,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
	}
});

export const upload = multer({
	storage: multerS3({
		s3,
		bucket: process.env.S3_BUCKET_NAME,
		key: (req, file, cb) => {
			const extension = extname(file.originalname);
			cb(null, `${randomUUID()}${extension}`);
		}
	})
});

export const transporter = nodemailer.createTransport({
	port: 465,
	host: 'smtp.privateemail.com',
	auth: {
		user: 'noreply@historium.store',
		pass: process.env.EMAIL_PASSWORD
	},
	secure: true
});

export const vonage = new Vonage({
	apiKey: process.env.VONAGE_API_KEY,
	apiSecret: process.env.VONAGE_API_SECRET
});

export const createError = err => {
	return createHttpError(
		err.array ? 400 : err.status ?? 500,
		err.array ? JSON.stringify(err.array()) : err.message ?? err
	);
};

export const hashPassword = promisify(pbkdf2);

export const signJWT = promisify(jwt.sign);

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

export const transliterateToKey = string =>
	transliterate(string)
		.trim()
		.toLowerCase()
		.replaceAll(/\s+/g, '-')
		.replace(/[^a-zA-Z0-9-]/g, '');

export const isEmptyObject = obj => {
	for (let key in obj) {
		return typeof obj[key] === 'object'
			? isEmptyObject(obj[key])
			: obj.hasOwnProperty(key) && !obj[key];
	}

	return true;
};

export const normalizePhoneNumber = phoneNumber => {
	return phoneNumber.startsWith('380')
		? `+${phoneNumber}`
		: phoneNumber.startsWith('0')
		? `+38${phoneNumber}`
		: phoneNumber;
};
