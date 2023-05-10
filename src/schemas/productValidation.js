import { body, param } from 'express-validator';

export const validateId = [
	param('id').isUUID().withMessage('Invalid product id format')
];

export const validateCreate = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Product name is required')
		.bail(),
	body('price')
		.isCurrency({
			allow_negatives: false,
			digits_after_decimal: [1, 2]
		})
		.withMessage('Product price must be a valid UAH value'),
	body('quantity')
		.trim()
		.notEmpty()
		.withMessage('Product quantity is required')
		.bail()
		.isInt({ min: 0 })
		.withMessage('Product quantity must be a positive integer')
];

export const validateUpdate = [
	validateId,
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product name can't be empty"),
	body('price')
		.optional()
		.isCurrency({
			allow_negatives: false,
			digits_after_decimal: [1, 2]
		})
		.withMessage('Product price must be a valid UAH value'),
	body('quantity')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Product quantity must be a positive integer')
];
