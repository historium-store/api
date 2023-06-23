import { body } from 'express-validator';
import { isArrayOfMongoIds } from '../../utils.js';

const validateCreate = [
	body('fullName')
		.trim()
		.notEmpty()
		.withMessage('Compiler full name is required'),
	body('books')
		.optional()
		.custom(isArrayOfMongoIds('Compiler', 'books'))
];

const validateUpdate = [
	body('fullName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Compiler full name can't be empty"),
	body('books')
		.optional()
		.custom(isArrayOfMongoIds('Compiler', 'books'))
];

export default {
	validateCreate,
	validateUpdate
};
