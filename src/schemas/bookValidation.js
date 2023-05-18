import { body, param } from 'express-validator';

export const validateId = [
	param('id')
		.isMongoId()
		.withMessage('Book id must be a valid mongo id')
];

export const validateCreate = [
	body('product.name')
		.trim()
		.notEmpty()
		.withMessage('Product name is required'),
	body('product.type')
		.exists()
		.withMessage('Product type is required')
		.isMongoId()
		.withMessage('Product type must be a valid mongo id'),
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
		.isArray({ min: 1, max: 3 })
		.withMessage('Product must have between 1 and 3 images'),
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
		.exists()
		.withMessage('Book publisher is required')
		.isMongoId()
		.withMessage('Book publisher must be a valid mongo id'),
	body('publishedIn')
		.isInt({ allow_negatives: false, min: 1400 })
		.withMessage('Invalid book publication year'),
	body('authors')
		.optional()
		.isArray()
		.withMessage('Book author(s) must be an array'),
	body('composers')
		.optional()
		.isArray()
		.withMessage('Book composer(s) must be an array'),
	body('translators')
		.optional()
		.isArray()
		.withMessage('Book translator(s) must be an array'),
	body('illustrators')
		.optional()
		.isArray()
		.withMessage('Book illustrator(s) must be an array'),
	body('editors')
		.optional()
		.isArray()
		.withMessage('Book editor(s) must be an array')
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
		.isMongoId()
		.withMessage('Product type must be a valid mongo id'),
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
		.isArray({ min: 1, max: 3 })
		.withMessage('Product must have between 1 and 3 images'),
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
		.isMongoId()
		.withMessage('Book publisher must be a valid mongo id'),
	body('publishedIn')
		.optional()
		.isInt({ allow_negatives: false, min: 1400 })
		.withMessage('Invalid book publication year'),
	body('authors')
		.optional()
		.isArray()
		.withMessage('Book author(s) must be an array'),
	body('composers')
		.optional()
		.isArray()
		.withMessage('Book composer(s) must be an array'),
	body('translators')
		.optional()
		.isArray()
		.withMessage('Book translator(s) must be an array'),
	body('illustrators')
		.optional()
		.isArray()
		.withMessage('Book illustrator(s) must be an array'),
	body('editors')
		.optional()
		.isArray()
		.withMessage('Book editor(s) must be an array')
];
