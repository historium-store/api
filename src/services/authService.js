import jwt from 'jsonwebtoken';
import config from '../config/main.js';
import User from '../models/user.js';
import userService from './userService.js';

const SECRET = process.env.SECRET || config.SECRET;

const createNewToken = credentials => {
	let user = null;
	try {
		user = userService.getOne(credentials);
	} catch (err) {
		throw err;
	}

	const payload = { sub: user.id };
	const options = {
		expiresIn: config.JWT_EXPIRATION,
		noTimestamp: true
	};
	const token = jwt.sign(payload, SECRET, options);

	return token;
};

const authenticate = async authHeader => {
	if (!authHeader) {
		throw {
			status: 401,
			message: 'Authorization header not provided'
		};
	}

	const token = authHeader.split(' ')[1];
	if (!token) {
		throw {
			status: 401,
			message: 'Token not provided'
		};
	}

	let payload = null;
	try {
		payload = await new Promise((resolve, reject) =>
			jwt.verify(token, SECRET, (err, payload) => {
				if (err) {
					reject({
						status: 401,
						message:
							err.name === 'TokenExpiredError'
								? 'Token has expired'
								: 'Invalid token'
					});
				}

				resolve(payload);
			})
		);
	} catch (err) {
		throw err;
	}

	let user = null;
	try {
		user = User.getOne({ id: payload.sub });
	} catch (err) {
		throw err;
	}

	return user;
};

export default { createNewToken, authenticate };
