import { body } from 'express-validator';
import { isArrayOfMongoIds } from '../../utils.js';

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
	body('fullName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Translator full name can't be empty"),
	body('books')
		.optional()
		.custom(isArrayOfMongoIds('Translator', 'books'))
];

export default {
	validateCreate,
	validateUpdate
};
