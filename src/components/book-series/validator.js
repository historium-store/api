import { body, param } from 'express-validator';
import { isArrayOfMongoIds } from '../../utils.js';

const validateId = [
	param('id')
		.isMongoId()
		.withMessage('Book series id must be a valid mongo id')
];

const validateCreate = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Book series name is required'),
	body('publisher')
		.exists()
		.withMessage('Publisher id is required')
		.bail()
		.isMongoId()
		.withMessage('Publisher id must be a valid mongo id'),
	body('books')
		.optional()
		.custom(isArrayOfMongoIds('Book series', 'books'))
];

const validateUpdate = [
	...validateId,
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book series name can't be empty"),
	body('publisher')
		.optional()
		.isMongoId()
		.withMessage('Publisher id must be a valid mongo id'),
	body('books')
		.optional()
		.custom(isArrayOfMongoIds('Book series', 'books'))
];

const validator = { validateId, validateCreate, validateUpdate };

export default validator;
