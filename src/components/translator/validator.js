import { body, param } from 'express-validator';
import { isArrayOfMongoIds } from '../../utils.js';

const validateId = [
	param('id')
		.isMongoId()
		.withMessage('Translator id must be a valid mongo id')
];

const validateCreate = [
	body('fullName')
		.trim()
		.notEmpty()
		.withMessage('Translator full name is required'),
	body('books')
		.optional()
		.custom(isArrayOfMongoIds('Translator', 'books'))
];

const validateUpdate = [
	...validateId,
	body('fullName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Translator full name can't be empty"),
	body('books')
		.optional()
		.custom(isArrayOfMongoIds('Translator', 'books'))
];

const validator = { validateId, validateCreate, validateUpdate };

export default validator;
