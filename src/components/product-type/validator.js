import { body, param } from 'express-validator';

const validateId = [
	param('id')
		.isMongoId()
		.withMessage('Product type id must be a valid mongo id')
];

const validateCreate = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Product type name is required'),
	body('key')
		.trim()
		.notEmpty()
		.withMessage('Product type key is required')
];

const validateUpdate = [
	...validateId,
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product type name can't be empty"),
	body('key')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product type key can't be empty")
];

const validator = { validateId, validateCreate, validateUpdate };

export default validator;
