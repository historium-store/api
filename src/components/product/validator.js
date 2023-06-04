import { body, param } from 'express-validator';
import { isArrayOfMongoIds } from '../../utils.js';

const validateCreate = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Product name is required'),
	body('key')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product key can't be empty"),
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
	body('quantity')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Product quantity must be a positive integer'),
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
		.isArray({ min: 1, max: 8 })
		.withMessage('Product must have between 1 and 8 images'),
	body('sections')
		.exists()
		.withMessage('Product must be in at least 1 section')
		.bail()
		.custom(isArrayOfMongoIds('Product', 'sections'))
];

const validateUpdate = [
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product name can't be empty"),
	body('key')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product key can't be empty"),
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
	body('quantity')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Product quantity must be a positive integer'),
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
	body('images')
		.optional()
		.isArray({ min: 1, max: 8 })
		.withMessage('Product must have between 1 and 8 images'),
	body('sections')
		.optional()
		.isArray({ min: 1 })
		.withMessage('Product must be in at least 1 section')
		.custom(isArrayOfMongoIds('Product', 'sections'))
];

const validator = { validateCreate, validateUpdate };

export default validator;
