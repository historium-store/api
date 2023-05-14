import { body, param } from 'express-validator';

export const validateId = [
	param('id').isMongoId().withMessage('Invalid book id format')
];

export const validateCreate = [
	body('product')
		.isObject({ strict: true })
		.withMessage('Product data is required')
		.bail({ level: 'request' }),
	body('product.name')
		.trim()
		.notEmpty()
		.withMessage('Product name is required'),
	body('product.type')
		.trim()
		.notEmpty()
		.withMessage('Product type is required')
		.bail()
		.isAlpha('uk-UA')
		.withMessage('Product type can only contain letters'),
	body('product.price')
		.isCurrency({
			allow_negatives: false,
			digits_after_decimal: [1, 2]
		})
		.withMessage('Product price must be a valid UAH value'),
	body('product.description')
		.trim()
		.notEmpty()
		.withMessage('Product description is required')
		.bail()
		.isLength({ min: 50, max: 10000 })
		.withMessage(
			'Product description must be between 50 and 10000 characters'
		),
	body('product.quantity')
		.default(1)
		.isInt({ min: 0 })
		.withMessage('Product quantity must be a positive integer'),
	body('type')
		.trim()
		.notEmpty()
		.withMessage('Book type is required')
		.bail()
		.isIn(['Паперова', 'Електронна', 'Аудіо'])
		.withMessage('Invalid book type'),
	body('language')
		.trim()
		.notEmpty()
		.withMessage('Book language is required')
		.bail()
		.isAlpha('uk-UA')
		.withMessage('Book language can only contain letters')
		.bail()
		.isLength({ min: 2, max: 50 })
		.withMessage('Book language must be between 2 and 50 characters'),
	body('publisher')
		.trim()
		.notEmpty()
		.withMessage('Book publisher name is required')
		.bail()
		.isLength({ min: 1, max: 100 })
		.withMessage(
			'Book publisher name must be between 1 and 100 characters'
		),
	body('publishedIn')
		.isInt({ allow_negatives: false, min: 1400 })
		.withMessage('Invalid book publication year')
];
