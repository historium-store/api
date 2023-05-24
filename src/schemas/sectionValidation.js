import { body, param } from 'express-validator';
import { isArrayOfMongoIds } from '../utils.js';

export const validateId = [
	param('id')
		.isMongoId()
		.withMessage('Section id must be a valid mongo id')
];

export const validateCreate = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Section name is required'),
	body('products').optional().custom(isArrayOfMongoIds),
	body('sections').optional().custom(isArrayOfMongoIds)
];

export const validateUpdate = [
	...validateId,
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Section name can't be empty"),
	body('products').optional().custom(isArrayOfMongoIds),
	body('sections').optional().custom(isArrayOfMongoIds)
];
