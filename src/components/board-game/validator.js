import { body } from 'express-validator';

const validateCreate = [
	body('product')
		.exists()
		.withMessage('Board game product is required')
		.bail()
		.isMongoId()
		.withMessage('Board game product must be a valid mongo id'),
	body('brand')
		.exists()
		.withMessage('Board game brand is required')
		.bail()
		.isMongoId()
		.withMessage('Board game brand must be a valid mongo id'),
	body('article')
		.trim()
		.notEmpty()
		.withMessage('Board game article number is required'),
	body('type')
		.trim()
		.notEmpty()
		.withMessage('Board game type is required'),
	body('kind')
		.trim()
		.notEmpty()
		.withMessage('Board game kind is required'),
	body('playersCount')
		.trim()
		.notEmpty()
		.withMessage('Board game players count is required'),
	body('packaging')
		.trim()
		.notEmpty()
		.withMessage('Board game packaging is required'),
	body('packageSize')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Invalid board game package size'),
	body('languages')
		.exists()
		.withMessage('Board game languages is required')
		.bail()
		.isArray()
		.withMessage('Board game languages must be an array'),
	body('ages')
		.exists()
		.withMessage('Board game ages is required')
		.bail()
		.isArray()
		.withMessage('Board game ages must be an array')
];

export default {
	validateCreate
};
