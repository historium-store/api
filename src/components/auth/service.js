import { Vonage } from '@vonage/server-sdk';
import { randomBytes, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import nodemalier from 'nodemailer';
import { hashPassword, verifyJWT } from '../../utils.js';
import User from '../user/model.js';
import userService from '../user/service.js';

const transporter = nodemalier.createTransport({
	port: 465,
	host: 'smtp.privateemail.com',
	auth: {
		user: 'noreply@historium.store',
		pass: process.env.EMAIL_PASSWORD
	},
	secure: true
});

const vonage = new Vonage({
	apiKey: process.env.VONAGE_API_KEY,
	apiSecret: process.env.VONAGE_API_SECRET
});

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
	// деструктуризация входных данных
	// для более удобного использования
	const { phoneNumber, email, password } = loginData;

	try {
		const foundUser = await User.findOne({
			$or: [
				{ phoneNumber, deletedAt: { $exists: false } },
				{ email, deletedAt: { $exists: false } }
			]
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

		const foundUser = await User.findOne({
			_id: id,
			deletedAt: { $exists: false }
		});

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
				message = "Token is invalid or doesn't exist";
				break;
			default:
				status = err.status ?? 500;
				message = err.message ?? err;
		}

		throw { status, message };
	}
};

const restorePassword = async loginData => {
	// деструктуризация входных данных
	// для более удобного использования
	const { phoneNumber, email } = loginData;

	try {
		// проверка существования пользователя
		// с входным номером телефона или почтой
		const foundUser = await User.findOne({
			$or: [
				{ phoneNumber, deletedAt: { $exists: false } },
				{ email, deletedAt: { $exists: false } }
			]
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

		const restorationToken = randomBytes(4).toString('hex');

		// если в качестве логина передали почту
		// отправляется письмо
		// иначе - СМС с кодом подтверждения
		if (email) {
			const mailData = {
				from: '"Historium" noreply@historium.store',
				to: foundUser.email,
				subject: 'Password restoration',
				html: `Restoration token: <b>${restorationToken}</b>`
			};

			await transporter.sendMail(mailData);
		} else {
			const from = 'Historium';
			const to = phoneNumber;
			const text = `Restoration token: ${restorationToken}\n\n`;

			await vonage.sms.send({ to, from, text });
		}

		await foundUser.updateOne({ $set: { restorationToken } });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const verifyRestore = async resetData => {
	// деструктуризация входных данных
	// для более удобного использования
	const { phoneNumber, email, restorationToken } = resetData;

	try {
		// проверка существования пользователя
		// с входным номером телефона или почтой
		const foundUser = await User.findOne({
			$or: [
				{ phoneNumber, deletedAt: { $exists: false } },
				{ email, deletedAt: { $exists: false } }
			]
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
			throw {
				status: 400,
				message: "User doesn't need restoration"
			};
		}

		if (restorationToken !== foundUser.restorationToken) {
			throw {
				status: 400,
				message: 'Incorrect restoration token'
			};
		}

		await foundUser.updateOne({
			$unset: { restorationToken: true }
		});

		const payload = { sub: foundUser.id };
		const options = {
			expiresIn: process.env.JWT_EXPIRATION,
			noTimestamp: true
		};
		const token = jwt.sign(payload, process.env.SECRET, options);

		return { id: foundUser.id, token };
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
	verifyRestore
};
