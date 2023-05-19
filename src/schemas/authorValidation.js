import { body, param } from 'express-validator';

export const validateId = [
	param('id')
		.isMongoId()
		.withMessage('Author id must be a valid mongo id')
];

export const validateCreate = [
	body('fullName')
		.trim()
		.notEmpty()
		.withMessage('Author full name is required'),
	body('biography')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Author biography can't be empty")
		.bail()
		.isLength({ min: 40, max: 1000 })
		.withMessage(
			'Author biography must be between 40 and 1000 characters'
		),
	body('pictures')
		.optional()
		.isArray({ min: 1, max: 3 })
		.withMessage('Author can have between 1 and 3 pictures')
];

export const validateUpdate = [
	...validateId,
	body('fullName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Author full name can\t be empty'),
	body('biography')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Author biography can't be empty")
		.bail()
		.isLength({ min: 40, max: 1000 })
		.withMessage(
			'Author biography must be between 40 and 1000 characters'
		),
	body('pictures')
		.optional()
		.isArray({ min: 1, max: 3 })
		.withMessage('Author can have between 1 and 3 pictures')
];
