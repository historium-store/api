import { body, param } from 'express-validator';
import { isArrayOfMongoIds } from '../utils.js';

export const validateId = [
	param('id')
		.isMongoId()
		.withMessage('Book series id must be a valid mongo id')
];

export const validateCreate = [
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
		.exists()
		.withMessage('Book series book(s) is required')
		.bail()
		.custom(isArrayOfMongoIds)
];

export const validateUpdate = [
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
	body('books').optional().custom(isArrayOfMongoIds)
];
