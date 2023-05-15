import { body, param } from 'express-validator';
import validator from 'validator';

export const validateId = [
	param('id').isMongoId().withMessage('Invalid product id format')
];

export const validateCreate = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Product name is required')
		.bail(),
	body('type')
		.trim()
		.notEmpty()
		.withMessage('Product type is required')
		.bail()
		.custom(value => {
			const valueCopy = value.slice().replace(' ', '');

			if (validator.isAlpha(valueCopy, 'uk-UA')) {
				return true;
			}

			throw 'Product type can only contain letters';
		}),
	body('price')
		.isCurrency({
			allow_negatives: false,
			digits_after_decimal: [1, 2]
		})
		.withMessage('Product price must be a valid UAH value'),
	body('description')
		.trim()
		.notEmpty()
		.withMessage('Product description is required')
		.bail()
		.isLength({ min: 50, max: 10000 })
		.withMessage(
			'Product description must be between 50 and 10000 characters'
		),
	body('quantity')
		.default(1)
		.isInt({ min: 0 })
		.withMessage('Product quantity must be a positive integer'),
	body('images')
		.isArray({ min: 1, max: 8 })
		.withMessage('Product must have between 1 and 8 images')
];

export const validateUpdate = [
	validateId,
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product name can't be empty"),
	body('type')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product type can't be empty")
		.bail()
		.custom(value => {
			const valueCopy = value.slice().replace(' ', '');

			if (validator.isAlpha(valueCopy, 'uk-UA')) {
				return true;
			}

			throw 'Product type can only contain letters';
		}),
	body('code')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product type can't be empty")
		.isNumeric({ no_symbols: true })
		.withMessage('Invalid product code format'),
	body('price')
		.optional()
		.isCurrency({
			allow_negatives: false,
			digits_after_decimal: [1, 2]
		})
		.withMessage('Product price must be a valid UAH value'),
	body('description')
		.optional()
		.trim()
		.isLength({ min: 50, max: 10000 })
		.withMessage(
			'Product description must be between 50 and 10000 characters'
		),
	body('quantity')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Product quantity must be a positive integer')
];
