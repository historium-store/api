import { body, header, param } from 'express-validator';

const validateId = [
	param('id')
		.isMongoId()
		.withMessage('User id must be a valid mongo id')
];

const validateUpdate = [
	...validateId,
	body('firstName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("User first name can't be empty")
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
		.isLength({ min: 2, max: 50 })
		.withMessage(
			'User last name must be between 2 and 50 characters'
		),
	body('phoneNumber')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("User phone number can't be empty")
		.bail()
		.isMobilePhone('uk-UA')
		.withMessage('Invalid user phone number format'),
	body('email')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("User email can't be empty")
		.bail()
		.isEmail()
		.withMessage('Invalid user email format')
		.normalizeEmail({
			gmail_remove_dots: false
		}),
	body('password')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("User password can't be empty")
		.bail()
		.isLength({ min: 8, max: 50 })
		.withMessage('User password must be between 8 and 50 characters'),
	body('role')
		.optional()
		.isIn(['user', 'seller', 'admin'])
		.withMessage('Invalid user role')
];

export default { validateId, validateUpdate };
