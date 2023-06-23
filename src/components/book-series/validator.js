import { body } from 'express-validator';
import { isArrayOfMongoIds } from '../../utils.js';

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
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book series name can't be empty"),
	body('books')
		.optional()
		.custom(isArrayOfMongoIds('Book series', 'books'))
];

export default {
	validateCreate,
	validateUpdate
};
