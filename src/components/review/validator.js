import { body, param } from 'express-validator';
import { isArrayOfMongoIds } from '../../utils.js';

const validateId = [
	param('id')
		.isMongoId()
		.withMessage('Review id must be a valid mongo id')
];

const validateCreate = [
	body('product')
		.trim()
		.notEmpty()
		.withMessage('Review product id is required')
		.bail()
		.isMongoId()
		.withMessage('Review product id must be a valid mongo id'),
	body('user')
		.trim()
		.notEmpty()
		.withMessage('Review user id is required')
		.bail()
		.isMongoId()
		.withMessage('Review user id must be a valid mongo id'),
	body('title')
		.trim()
		.notEmpty()
		.withMessage('Review title is required'),
	body('text')
		.trim()
		.notEmpty()
		.withMessage('Review text is required'),
	body('rating')
		.trim()
		.notEmpty()
		.withMessage('Review rating is required')
		.bail()
		.isInt({ min: 0, max: 5 })
		.withMessage('Review rating must be an integer between 0 and 5')
];

const validateUpdate = [
	...validateId,
	body('product')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Review product id is required')
		.bail()
		.isMongoId()
		.withMessage('Review product id must be a valid mongo id'),
	body('user')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Review user id is required')
		.bail()
		.isMongoId()
		.withMessage('Review user id must be a valid mongo id'),
	body('title')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Review title is required'),
	body('text')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Review text is required'),
	body('rating')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Review rating is required')
		.bail()
		.isInt({ min: 0, max: 5 })
		.withMessage('Review rating must be an integer between 0 and 5')
];

const validator = { validateId, validateCreate, validateUpdate };

export default validator;