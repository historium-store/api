import { body, param } from 'express-validator';
import { isArrayOfMongoIds } from '../../utils.js';

const validateId = [
	param('id')
		.isMongoId()
		.withMessage('Author id must be a valid mongo id')
];

const validateCreate = [
	body('fullName')
		.trim()
		.notEmpty()
		.withMessage('Author full name is required'),
	body('books')
		.optional()
		.custom(isArrayOfMongoIds('Author', 'books')),
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

const validateUpdate = [
	...validateId,
	body('fullName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Author full name can't be empty"),
	body('books')
		.optional()
		.custom(isArrayOfMongoIds('Author', 'books')),
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

const validator = {
	validateId,
	validateCreate,
	validateUpdate
};

export default validator;