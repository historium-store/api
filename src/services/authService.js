import { randomBytes, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import nodemalier from 'nodemailer';
import { User } from '../models/index.js';
import { hashPassword, verifyJWT } from '../utils/promisified.js';
import userService from './userService.js';

const signup = async userData => {
	try {
		return await userService.createOne(userData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const login = async loginData => {
	const { phoneNumber, email, password } = loginData;

	try {
		const foundUser = await User.findOne({
			$or: [{ phoneNumber }, { email }]
		});

		if (!foundUser) {
			throw {
				status: 404,
				message:
					'User with ' +
					(phoneNumber
						? `phone number '${phoneNumber}'`
						: `email '${email}'`) +
					' not found'
			};
		}

		const hashedPassword = await hashPassword(
			password,
			Buffer.from(foundUser.salt, 'hex'),
			310000,
			32,
			'sha256'
		);

		const savedPassword = Buffer.from(foundUser.password, 'hex');

		if (!timingSafeEqual(savedPassword, hashedPassword)) {
			throw {
				status: 400,
				message: 'Incorrect password'
			};
		}

		const payload = { sub: foundUser.id };
		const options = {
			expiresIn: process.env.JWT_EXPIRATION,
			noTimestamp: true
		};

		return jwt.sign(payload, process.env.SECRET, options);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const authenticate = async authHeader => {
	if (!authHeader) {
		throw {
			status: 401,
			message: 'Authorization header not provided'
		};
	}

	const tokenParts = authHeader.split(' ');

	if (tokenParts[0] !== 'Bearer') {
		throw {
			status: 401,
			message: "Authorization scheme 'Bearer' required"
		};
	}

	if (!tokenParts[1]) {
		throw { status: 401, message: 'Token not provided' };
	}

	try {
		const { sub: id } = await verifyJWT(
			tokenParts[1],
			process.env.SECRET
		);
		const foundUser = await User.findById(id);

		if (!foundUser) {
			throw {
				status: 404,
				message: `User with id '${id}' not found`
			};
		}

		return foundUser;
	} catch (err) {
		let status;
		let message;

		switch (err.name) {
			case 'TokenExpiredError':
				status = 401;
				message = 'Token has expired';
				break;
			case 'JsonWebTokenError':
				status = 401;
				message = 'Invalid token format';
				break;
			default:
				status = err.status ?? 500;
				message = err.message ?? err;
		}

		throw { status, message };
	}
};

const restorePassword = async loginData => {
	const { phoneNumber, email } = loginData;

	try {
		const userToRestore = await User.findOne({
			$or: [{ phoneNumber }, { email }]
		});

		if (!userToRestore) {
			throw {
				status: 404,
				message:
					'User with ' +
					(phoneNumber
						? `phone number '${phoneNumber}'`
						: `email '${email}'`) +
					' not found'
			};
		}

		if (email) {
			const transporter = nodemalier.createTransport({
				port: 465,
				host: 'smtp.gmail.com',
				auth: {
					user: 'historium.store@gmail.com',
					pass: process.env.EMAIL_PASSWORD
				},
				secure: true
			});

			const restorationToken = randomBytes(4).toString('hex');
			const mailData = {
				from: '"Historium" historium.store@gmail.com',
				to: userToRestore.email,
				subject: 'Password restoration',
				html: `Restoration token: <b>${restorationToken}</b>`
			};

			await transporter.sendMail(mailData);

			await userToRestore.updateOne({ $set: { restorationToken } });
		}
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const verifyRestorationToken = async resetData => {
	const { phoneNumber, email, restorationToken } = resetData;

	try {
		const foundUser = await User.findOne({
			$or: [{ phoneNumber }, { email }]
		});

		if (!foundUser) {
			throw {
				status: 404,
				message:
					'User with ' +
					(phoneNumber
						? `phone number '${phoneNumber}'`
						: `email '${email}'`) +
					' not found'
			};
		}

		if (!foundUser.restorationToken) {
			throw { status: 400, message: "User doesn't need restoration" };
		}

		if (restorationToken !== foundUser.restorationToken) {
			throw {
				status: 400,
				message: 'Incorrect restoration token'
			};
		}

		await foundUser.updateOne({ $unset: { restorationToken: true } });

		return `${foundUser.id}`;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default {
	signup,
	login,
	authenticate,
	restorePassword,
	verifyRestorationToken
};
