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
		.withMessage('Product type name is required')
];

const validateUpdate = [
	...validateId,
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product type name can't be empty")
];

const validator = { validateId, validateCreate, validateUpdate };

export default validator;
