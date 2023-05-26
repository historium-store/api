import { body, param } from 'express-validator';
import { isArrayOfMongoIds } from '../../utils.js';

const validateId = [
	param('id')
		.isMongoId()
		.withMessage('Compiler id must be a valid mongo id')
];

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
	...validateId,
	body('fullName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Compiler full name can't be empty"),
	body('books')
		.optional()
		.custom(isArrayOfMongoIds('Compiler', 'books'))
];

const validator = { validateId, validateCreate, validateUpdate };

export default validator;
