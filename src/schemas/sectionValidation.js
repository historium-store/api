import { body, param } from 'express-validator';

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
	body('products')
		.isArray()
		.withMessage('Section product(s) must be an array'),
	body('sections')
		.isArray()
		.withMessage('Section section(s) must be an array')
];

export const validateUpdate = [
	...validateId,
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Section name can't be empty"),
	body('products')
		.optional()
		.isArray()
		.withMessage('Section product(s) must be an array'),
	body('sections')
		.optional()
		.isArray()
		.withMessage('Section section(s) must be an array')
];
