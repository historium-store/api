import { body, param } from 'express-validator';
import { isArrayOfMongoIds } from '../../utils.js';

const validateId = [
	param('id')
		.isMongoId()
		.withMessage('Editor id must be a valid mongo id')
];

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
	...validateId,
	body('fullName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Editor full name can't be empty"),
	body('books')
		.optional()
		.custom(isArrayOfMongoIds('Editor', 'books'))
];

const validator = { validateId, validateCreate, validateUpdate };

export default validator;
