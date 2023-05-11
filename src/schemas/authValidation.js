import { body } from 'express-validator';
import validator from 'validator';

export const validateSignup = [
	body('firstName')
		.trim()
		.notEmpty()
		.withMessage('User first name is required')
		.bail()
		.custom(value => {
			const valueCopy = value.slice().replace(' ', '');

			if (
				validator.isAlpha(valueCopy, 'uk-UA') ||
				validator.isAlpha(valueCopy, 'ru-RU') ||
				validator.isAlpha(valueCopy, 'en-US')
			) {
				return true;
			}

			throw {
				message: 'User first name can only contain letters'
			};
		})
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
		.custom(value => {
			const valueCopy = value.slice().replace(' ', '');

			if (
				validator.isAlpha(valueCopy, 'uk-UA') ||
				validator.isAlpha(valueCopy, 'ru-RU') ||
				validator.isAlpha(valueCopy, 'en-US')
			) {
				return true;
			}

			throw {
				message: 'User last name can only contain letters'
			};
		})
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
		.withMessage('Invalid user email format')
		.normalizeEmail(),
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
		.bail()
		.custom(value => {
			if (
				validator.isMobilePhone(value, 'uk-UA') ||
				validator.isEmail(value)
			) {
				return true;
			}

			throw 'Invalid user phone number or email format';
		})
		.if(body('login').isEmail())
		.normalizeEmail(),
	body('password')
		.trim()
		.isLength({ min: 8, max: 50 })
		.withMessage('User password must be between 8 and 50 characters')
];
