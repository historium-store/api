import { body, param } from 'express-validator';

export const validateId = [
	param('id')
		.isMongoId()
		.withMessage('Product id must be a valid mongo id')
];

export const validateCreate = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Product name is required'),
	body('type')
		.exists()
		.withMessage('Product type is required')
		.bail()
		.isMongoId()
		.withMessage('Product type must be a valid mongo id'),
	body('price')
		.isCurrency({
			allow_negatives: false,
			digits_after_decimal: [1, 2]
		})
		.withMessage('Product price must be a valid currency value'),
	body('description')
		.trim()
		.notEmpty()
		.withMessage('Product description is required')
		.bail()
		.isLength({ min: 50, max: 10000 })
		.withMessage(
			'Product description must be between 50 and 10000 characters'
		),
	body('images')
		.isArray({ min: 1, max: 3 })
		.withMessage('Product must have between 1 and 3 images'),
	body('quantity')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Product quantity must be a positive integer'),
	body('sections')
		.isArray({ min: 1 })
		.withMessage('Product must be in at least 1 section')
];

export const validateUpdate = [
	...validateId,
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product name can't be empty"),
	body('type')
		.optional()
		.isMongoId()
		.withMessage('Product type must be a valid mongo id'),
	body('price')
		.optional()
		.isCurrency({
			allow_negatives: false,
			digits_after_decimal: [1, 2]
		})
		.withMessage('Product price must be a valid currency value'),
	body('description')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product description can't be empty")
		.bail()
		.isLength({ min: 50, max: 10000 })
		.withMessage(
			'Product description must be between 50 and 10000 characters'
		),
	body('quantity')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Product quantity must be a positive integer'),
	body('images')
		.optional()
		.isArray({ min: 1, max: 3 })
		.withMessage('Product must have between 1 and 3 images'),
	body('sections')
		.optional()
		.isArray({ min: 1 })
		.withMessage('Product must be in at least 1 section')
];
