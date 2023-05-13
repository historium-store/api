import { body, param } from 'express-validator';
import validator from 'validator';

export const validateId = param('id')
	.isMongoId()
	.withMessage('Invalid user id format');

export const validateUpdate = [
	validateId,
	body('firstName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("User first name can't be empty")
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

			throw 'User first name can only contain letters';
		})
		.bail()
		.isLength({ min: 2, max: 50 })
		.withMessage(
			'User first name must be between 2 and 50 characters'
		),
	body('lastName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("User last name can't be empty")
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

			throw 'User last name can only contain letters';
		})
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
		.withMessage('Invalid user email format')
		.bail()
		.normalizeEmail({ gmail_remove_dots: false }),
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
