import { body, param } from 'express-validator';
import { isArrayOfMongoIds } from '../utils.js';

export const validateId = [
	param('id')
		.isMongoId()
		.withMessage('Translator id must be a valid mongo id')
];

export const validateCreate = [
	body('fullName')
		.trim()
		.notEmpty()
		.withMessage('Translator full name is required'),
	body('books').optional().custom(isArrayOfMongoIds)
];

export const validateUpdate = [
	...validateId,
	body('fullName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Translator full name can't be empty"),
	body('books').optional().custom(isArrayOfMongoIds)
];
