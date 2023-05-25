import { body, param } from 'express-validator';
import { isArrayOfMongoIds } from '../../utils.js';

const validateId = [
	param('id')
		.isMongoId()
		.withMessage('Section id must be a valid mongo id')
];

const validateCreate = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Section name is required'),
	body('key')
		.trim()
		.notEmpty()
		.withMessage('Section key is required'),
	body('products')
		.optional()
		.custom(isArrayOfMongoIds('Section', 'products')),
	body('sections')
		.optional()
		.custom(isArrayOfMongoIds('Section', 'sections'))
];

const validateUpdate = [
	...validateId,
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Section name can't be empty"),
	body('key')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Section key can't be empty"),
	body('products')
		.optional()
		.custom(isArrayOfMongoIds('Section', 'products')),
	body('sections')
		.optional()
		.custom(isArrayOfMongoIds('Section', 'sections'))
];

const validator = { validateId, validateCreate, validateUpdate };

export default validator;
