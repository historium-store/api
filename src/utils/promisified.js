import { pbkdf2, randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

export const hashPassword = promisify(pbkdf2);

export const verifyJWT = promisify(jwt.verify);

export const formatFilename = promisify((req, file, cb) => {
	const extension = file.mimetype.split('/')[1];
	cb(null, `${randomUUID()}.${extension}`);
});
