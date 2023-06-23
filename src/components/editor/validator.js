import { body } from 'express-validator';
import { isArrayOfMongoIds } from '../../utils.js';

const validateCreate = [
	body('fullName')
		.trim()
		.notEmpty()
		.withMessage('Editor full name is required'),
	body('books')
		.optional()
		.custom(isArrayOfMongoIds('Editor', 'books'))
];

const validateUpdate = [
	body('fullName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Editor full name can't be empty"),
	body('books')
		.optional()
		.custom(isArrayOfMongoIds('Editor', 'books'))
];

export default {
	validateCreate,
	validateUpdate
};
