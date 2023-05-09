import { body, oneOf, param } from 'express-validator';
import validator from 'validator';

export const validateId = param('id')
	.isUUID()
	.withMessage('Invalid user id format');

export const signupSchema = {
	firstName: {
		notEmpty: { errorMessage: 'First name is required', bail: true },
		isLength: {
			options: { min: 2, max: 50 },
			errorMessage: 'First name must be between 2 and 50 characters'
		}
	},
	lastName: {
		notEmpty: { errorMessage: 'Last name is required', bail: true },
		isLength: {
			options: { min: 2, max: 50 },
			errorMessage: 'Last name must be between 2 and 50 characters'
		}
	},
	phoneNumber: {
		notEmpty: {
			errorMessage: 'Phone number is required',
			bail: true
		},
		isMobilePhone: {
			locale: 'uk-UA',
			errorMessage: 'Invalid phone number format'
		}
	},
	email: {
		notEmpty: { errorMessage: 'Email is required', bail: true },
		isEmail: { errorMessage: 'Invalid email format' }
	},
	password: {
		notEmpty: { errorMessage: 'Password is required', bail: true },
		isLength: {
			options: { min: 8, max: 50 },
			errorMessage: 'Password must be between 8 and 50 characters'
		}
	},
	role: {
		default: { options: 'user' }
	}
};

export const validateSignup = [
	body('firstName')
		.trim()
		.notEmpty()
		.withMessage('User first name is required')
		.bail()
		.isString()
		.withMessage('User first name must be a string')
		.bail()
		.isLength({ min: 2, max: 50 })
		.withMessage(
			'User first name must be between 2 and 50 characters'
		),
	body('lastName')
		.trim()
		.notEmpty()
		.withMessage('User last name is required')
		.bail()
		.isString()
		.withMessage('User last name must be a string')
		.bail()
		.isLength({ min: 2, max: 50 })
		.withMessage(
			'User last name must be between 2 and 50 characters'
		),
	body('phoneNumber')
		.trim()
		.notEmpty()
		.withMessage('User phone number is required')
		.bail()
		.isMobilePhone('uk-UA')
		.withMessage('Invalid user phone number format'),
	body('email')
		.trim()
		.notEmpty()
		.withMessage('User email is required')
		.bail()
		.isEmail()
		.withMessage('Invalid user email format'),
	body('password')
		.trim()
		.notEmpty()
		.withMessage('User password is required')
		.bail()
		.isLength({ min: 8, max: 50 })
		.withMessage('User password must be between 8 and 50 characters'),
	body('role')
		.default('user')
		.isIn(['user', 'seller', 'admin'])
		.withMessage('Invalid user role')
];

export const validateLogin = [
	body('login')
		.trim()
		.notEmpty()
		.withMessage('User phone number or email is required')
		.custom(value => {
			if (
				!validator.isMobilePhone(value, 'uk-UA') &&
				!validator.isEmail(value)
			) {
				throw {
					message: 'Invalid user phone number or email format'
				};
			}

			return true;
		}),
	body('password')
		.trim()
		.isLength({ min: 8, max: 50 })
		.withMessage('User password must be between 8 and 50 characters')
];

export const validateUpdate = [
	validateId,
	body('firstName')
		.optional()
		.trim()
		.isString()
		.withMessage('User first name must be a string')
		.bail()
		.isLength({ min: 2, max: 50 })
		.withMessage(
			'User first name must be between 2 and 50 characters'
		),
	body('lastName')
		.optional()
		.trim()
		.isString()
		.withMessage('User last name must be a string')
		.bail()
		.isLength({ min: 2, max: 50 })
		.withMessage(
			'User last name must be between 2 and 50 characters'
		),
	body('phoneNumber')
		.optional()
		.isMobilePhone('uk-UA')
		.withMessage('Invalid user phone number format'),
	body('email')
		.optional()
		.isEmail()
		.withMessage('Invalid user email format'),
	body('password')
		.optional()
		.trim()
		.isLength({ min: 8, max: 50 })
		.withMessage('User password must be between 8 and 50 characters'),
	body('role')
		.optional()
		.isIn(['user', 'seller', 'admin'])
		.withMessage('Invalid user role')
];
