import { body } from 'express-validator';

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

export default {
	validateCreate,
	validateUpdate
};
