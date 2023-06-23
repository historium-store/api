import { randomBytes, timingSafeEqual } from 'crypto';
import {
	JWT_OPTIONS,
	hashPassword,
	normalizePhoneNumber,
	signJWT,
	transporter,
	verifyJWT,
	vonage
} from '../../utils.js';
import User from '../user/model.js';
import userService from '../user/service.js';

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
	let { phoneNumber, email, password } = loginData;

	try {
		if (phoneNumber) {
			phoneNumber = normalizePhoneNumber(phoneNumber);
		}

		const foundUser = await User.where('deletedAt')
			.exists(false)
			.or([{ phoneNumber }, { email }])
			.findOne();

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

		if (!(foundUser.temporaryPassword === password)) {
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
		}

		const token = await signJWT(
			{ sub: foundUser.id },
			process.env.SECRET,
			JWT_OPTIONS
		);

		return { token };
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

	const token = tokenParts[1];
	if (!token) {
		throw { status: 401, message: 'Token not provided' };
	}

	try {
		const { sub: id } = await verifyJWT(token, process.env.SECRET);

		const foundUser = await User.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

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
	let { phoneNumber, email } = loginData;

	try {
		if (phoneNumber) {
			phoneNumber = normalizePhoneNumber(phoneNumber);
		}

		const foundUser = await User.where('deletedAt')
			.exists(false)
			.or([{ phoneNumber }, { email }])
			.findOne();

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

		const temporaryPassword = randomBytes(8).toString('hex');

		if (email) {
			const mailData = {
				from: '"Historium" noreply@historium.store',
				to: foundUser.email,
				subject: 'Password restoration',
				html: `Temporary password: <b>${temporaryPassword}</b>`
			};

			await transporter.sendMail(mailData);
		} else {
			const from = 'Historium';
			const to = phoneNumber;
			const text = `Temporary password: ${temporaryPassword}\n\n`;

			await vonage.sms.send({ to, from, text });
		}

		await foundUser.updateOne({ $set: { temporaryPassword } });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

// const verifyRestore = async restoreData => {
// 	let { phoneNumber, email, restorationToken } = restoreData;

// 	try {
// 		phoneNumber = normalizePhoneNumber(phoneNumber);

// 		const foundUser = await User.where('deletedAt')
// 			.exists(false)
// 			.or([{ phoneNumber }, { email }])
// 			.findOne();

// 		if (!foundUser) {
// 			throw {
// 				status: 404,
// 				message:
// 					'User with ' +
// 					(phoneNumber
// 						? `phone number '${phoneNumber}'`
// 						: `email '${email}'`) +
// 					' not found'
// 			};
// 		}

// 		if (!foundUser.restorationToken) {
// 			throw {
// 				status: 400,
// 				message: "User doesn't need restoration"
// 			};
// 		}

// 		if (restorationToken !== foundUser.restorationToken) {
// 			throw {
// 				status: 400,
// 				message: 'Incorrect restoration token'
// 			};
// 		}

// 		await foundUser.updateOne({
// 			$unset: { restorationToken: true }
// 		});

// 		const payload = {
// 			sub: foundUser.id
// 		};
// 		const options = {
// 			expiresIn: process.env.JWT_EXPIRATION,
// 			noTimestamp: true
// 		};
// 		const token = jwt.sign(payload, process.env.SECRET, options);

// 		return { id: foundUser.id, token };
// 	} catch (err) {
// 		throw {
// 			status: err.status ?? 500,
// 			message: err.message ?? err
// 		};
// 	}
// };

export default {
	signup,
	login,
	authenticate,
	restorePassword
	// verifyRestore
};
