import { body, param } from 'express-validator';

export const validateId = [
	param('id').isMongoId().withMessage('Invalid book id format')
];

export const validateCreate = [
	body('product.name')
		.trim()
		.notEmpty()
		.withMessage('Product name is required'),
	body('product.type')
		.trim()
		.notEmpty()
		.withMessage('Product type is required'),
	body('product.price')
		.isCurrency({
			allow_negatives: false,
			digits_after_decimal: [1, 2]
		})
		.withMessage('Product price must be a valid currency value'),
	body('product.description')
		.trim()
		.notEmpty()
		.withMessage('Product description is required')
		.bail()
		.isLength({ min: 50, max: 10000 })
		.withMessage(
			'Product description must be between 50 and 10000 characters'
		),
	body('product.images')
		.isArray({ min: 1, max: 8 })
		.withMessage('Product must have between 1 and 8 images'),
	body('product.quantity')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Product quantity must be a positive integer'),
	body('product.sections')
		.isArray({ min: 1 })
		.withMessage('Product must be in at least 1 section'),
	body('type').trim().notEmpty().withMessage('Book type is required'),
	body('languages')
		.isArray({ min: 1 })
		.withMessage('Book must have at least 1 language'),
	body('publisher')
		.trim()
		.notEmpty()
		.withMessage('Publisher name is required')
		.bail()
		.isLength({ min: 1, max: 100 })
		.withMessage(
			'Publisher name must be between 1 and 100 characters'
		),
	body('publishedIn')
		.isInt({ allow_negatives: false, min: 1400 })
		.withMessage('Invalid book publication year')
];

export const validateUpdate = [
	...validateId,
	body('product.name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product name can't be empty"),
	body('product.type')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product type can't be empty"),
	body('product.price')
		.optional()
		.isCurrency({
			allow_negatives: false,
			digits_after_decimal: [1, 2]
		})
		.withMessage('Product price must be a valid currency value'),
	body('product.description')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product description can't be empty")
		.bail()
		.isLength({ min: 50, max: 10000 })
		.withMessage(
			'Product description must be between 50 and 10000 characters'
		),
	body('product.images')
		.optional()
		.isArray({ min: 1, max: 8 })
		.withMessage('Product must have between 1 and 8 images'),
	body('product.quantity')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Product quantity must be a positive integer'),
	body('product.sections')
		.optional()
		.isArray({ min: 1 })
		.withMessage('Product must be in at least 1 section'),
	body('type')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book type can't be empty"),
	body('languages')
		.optional()
		.isArray({ min: 1 })
		.withMessage('Book must have at least 1 language'),
	body('publisher')
		.optional()
		.trim()
		.isLength({ min: 1, max: 100 })
		.withMessage(
			'Book publisher name must be between 1 and 100 characters'
		),
	body('publishedIn')
		.optional()
		.isInt({ allow_negatives: false, min: 1400 })
		.withMessage('Invalid book publication year')
];
